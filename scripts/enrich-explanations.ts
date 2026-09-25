/**
 * enrich-explanations.ts
 *
 * Hybrid explanation enrichment pipeline.
 *
 * Strategy (in priority order):
 *   1. If ALOC supplied a non-placeholder solution → clean & use it  (source: 'aloc')
 *   2. Otherwise → call Gemini with a grounded prompt               (source: 'ai_generated')
 *   3. If Gemini response contains hedge words → mark unreviewed     (flagged for admin queue)
 *
 * Usage:
 *   npx tsx scripts/enrich-explanations.ts              # process all placeholders
 *   npx tsx scripts/enrich-explanations.ts --limit 50   # process first 50 only
 *   npx tsx scripts/enrich-explanations.ts --dry-run    # print without writing
 */

import * as dotenv from 'dotenv';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, or, isNull } from 'drizzle-orm';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { pastQuestions } from '../src/db/schema';

dotenv.config({ path: '.env.local' });

// ── CLI flags ────────────────────────────────────────────────────────────────
const args        = process.argv.slice(2);
const DRY_RUN     = args.includes('--dry-run');
const limitFlag   = args.indexOf('--limit');
const LIMIT       = limitFlag !== -1 ? parseInt(args[limitFlag + 1] ?? '9999') : 9999;
const BATCH_DELAY = 600; // ms between Gemini calls — stay within free-tier RPM

// ── DB + AI setup ─────────────────────────────────────────────────────────────
const DATABASE_URL = process.env.DATABASE_URL || process.env.DIRECT_URL;
const GEMINI_KEY   = process.env.GEMINI_API_KEY;

if (!DATABASE_URL) throw new Error('DATABASE_URL not set in .env.local');
if (!GEMINI_KEY)   throw new Error('GEMINI_API_KEY not set in .env.local');

const sql    = postgres(DATABASE_URL, { prepare: false });
const db     = drizzle(sql);
const genAI  = new GoogleGenerativeAI(GEMINI_KEY);
const model  = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// ── Types ─────────────────────────────────────────────────────────────────────
type OptionRow = { key: string; text: string; isCorrect: boolean };
type ExplanationSource = 'aloc' | 'ai_generated' | 'placeholder';

// ── Hedge word detector ───────────────────────────────────────────────────────
// If Gemini is unsure it will use hedging language → flag for human review.
const HEDGE_PATTERNS = [
  /\bi\s+believe\b/i,
  /\bi\s+think\b/i,
  /\bprobably\b/i,
  /\bperhaps\b/i,
  /\bmight\s+be\b/i,
  /\bi\s+am\s+not\s+sure\b/i,
  /\bnot\s+entirely\s+certain\b/i,
  /\bit\s+is\s+possible\b/i,
  /\bapproximately\b/i,
  /\bcould\s+be\b/i,
  /\buncertain\b/i,
];

function hasHedgeLanguage(text: string): boolean {
  return HEDGE_PATTERNS.some(p => p.test(text));
}

// ── HTML stripper (same as ingest script) ─────────────────────────────────────
function stripHtml(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// ── Subject display names ─────────────────────────────────────────────────────
const SUBJECT_NAMES: Record<string, string> = {
  USE_OF_ENGLISH: 'Use of English',
  MATHEMATICS:    'Mathematics',
  PHYSICS:        'Physics',
  CHEMISTRY:      'Chemistry',
  BIOLOGY:        'Biology',
  ECONOMICS:      'Economics',
  GOVERNMENT:     'Government / Civics',
};

// ── Gemini prompt builder ─────────────────────────────────────────────────────
function buildPrompt(
  subject: string,
  questionText: string,
  options: OptionRow[],
  correctOption: string,
): string {
  const correctOptionObj = options.find(o => o.key === correctOption);
  const optionsText = options
    .map(o => `   ${o.key}. ${o.text}${o.isCorrect ? '  ← CORRECT ANSWER' : ''}`)
    .join('\n');

  return `You are an expert ${SUBJECT_NAMES[subject] ?? subject} tutor for Nigerian JAMB UTME students.

QUESTION:
${questionText}

OPTIONS:
${optionsText}

CORRECT ANSWER: ${correctOption}. ${correctOptionObj?.text ?? ''}

Your task: Write a clear, concise step-by-step explanation (3–5 sentences) of WHY option ${correctOption} is correct.
Rules:
- Ground your explanation ONLY in facts implied by the question and standard ${SUBJECT_NAMES[subject] ?? subject} theory.
- Do NOT say "I think", "I believe", "probably", or use any uncertain language.
- Do NOT repeat the question back verbatim.
- Use simple language suitable for a Nigerian secondary school student.
- If it is a calculation, show the key steps.
- End with one sentence that summarises the concept being tested.

Explanation:`;
}

// ── Gemini call with retry ────────────────────────────────────────────────────
async function generateExplanation(prompt: string, retries = 2): Promise<string | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const text   = result.response.text().trim();
      return text.length > 20 ? text : null;
    } catch (err) {
      const msg = (err as Error).message;
      if (msg.includes('429') && attempt < retries) {
        // Rate limited — back off 5 seconds
        console.warn('  ⚠️  Rate limited — waiting 5s…');
        await new Promise(r => setTimeout(r, 5000));
      } else {
        console.error('  Gemini error:', msg);
        return null;
      }
    }
  }
  return null;
}

// ── Sleep helper ──────────────────────────────────────────────────────────────
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// ── Main ──────────────────────────────────────────────────────────────────────
async function run() {
  console.log(`\n🔬 Hybrid Explanation Enrichment${DRY_RUN ? ' [DRY RUN]' : ''}\n`);

  // Fetch questions that still have a placeholder explanation
  const rows = await db
    .select()
    .from(pastQuestions)
    .where(
      or(
        eq(pastQuestions.explanationSource, 'placeholder'),
        isNull(pastQuestions.explanationSource),
      ),
    )
    .limit(LIMIT);

  console.log(`Found ${rows.length} questions needing explanations.\n`);

  let countAloc    = 0;
  let countAI      = 0;
  let countFailed  = 0;
  let countFlagged = 0;

  for (let i = 0; i < rows.length; i++) {
    const q = rows[i];
    const options = (q.options as OptionRow[]) ?? [];
    const prefix  = `[${i + 1}/${rows.length}] alocId=${q.alocId ?? q.id}`;

    // ── Layer 1: Does the stored explanation look like real ALOC content?
    //    The ingest script puts 'Official JAMB past question answer key.' for blanks.
    const isPlaceholder =
      !q.explanation ||
      q.explanation === 'Official JAMB past question answer key.' ||
      q.explanation.trim().length < 20;

    if (!isPlaceholder) {
      // Already has a real ALOC explanation — just mark it correctly
      console.log(`${prefix} ✅ ALOC explanation already present — marking source.`);
      if (!DRY_RUN) {
        await db
          .update(pastQuestions)
          .set({ explanationSource: 'aloc', explanationReviewed: true })
          .where(eq(pastQuestions.id, q.id));
      }
      countAloc++;
      continue;
    }

    // ── Layer 2: Call Gemini
    console.log(`${prefix} 🤖 Generating via Gemini (${q.subject})…`);

    const prompt = buildPrompt(
      q.subject ?? 'GENERAL',
      q.questionText,
      options,
      q.correctOption,
    );

    if (DRY_RUN) {
      console.log('  [DRY RUN] Prompt preview:');
      console.log('  ' + prompt.split('\n').slice(0, 6).join('\n  '));
      countAI++;
      continue;
    }

    const generated = await generateExplanation(prompt);

    if (!generated) {
      console.warn(`${prefix} ❌ Gemini returned nothing — skipping.`);
      countFailed++;
      await sleep(BATCH_DELAY);
      continue;
    }

    // ── Layer 3: Confidence check
    const hasHedge  = hasHedgeLanguage(generated);
    const reviewed  = !hasHedge; // Auto-approve only if no hedge words

    if (hasHedge) {
      console.warn(`${prefix} ⚠️  Hedge language detected — flagged for human review.`);
      countFlagged++;
    } else {
      console.log(`${prefix} ✅ Clean explanation generated.`);
    }

    await db
      .update(pastQuestions)
      .set({
        explanation:         generated,
        explanationSource:   'ai_generated',
        explanationReviewed: reviewed,
      })
      .where(eq(pastQuestions.id, q.id));

    countAI++;
    await sleep(BATCH_DELAY); // respect Gemini rate limit
  }

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Enrichment Complete
   ALOC source (trusted)  : ${countAloc}
   AI generated           : ${countAI}
     └─ Flagged for review : ${countFlagged}
   Failed / skipped       : ${countFailed}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${countFlagged > 0 ? '\n⚠️  Visit /admin/review-explanations to approve flagged explanations before launch.' : ''}
`);

  await sql.end();
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

