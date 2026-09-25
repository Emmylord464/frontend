/**
 * verify-and-ingest-aloc.ts
 *
 * Automated High-Throughput Verification & Ingestion Guard Pipeline for 20,000+ ALOC Questions.
 *
 * Features:
 *   1. Deterministic Structural Filtering (strips OCR/HTML artifacts, validates 4 distinct options)
 *   2. Gemini Blind-Solving AI Consensus (detects wrong answer keys & quarantines ambiguous questions)
 *   3. Official Textbook Grounding (Anyakoha, Dele Ashade, Ababio, Ramalingam, etc.)
 *   4. Safe Database Ingestion into PostgreSQL with Drizzle ORM
 *
 * Usage:
 *   npx tsx scripts/verify-and-ingest-aloc.ts --subject english --limit 50
 *   npx tsx scripts/verify-and-ingest-aloc.ts --all --dry-run
 */

import * as dotenv from 'dotenv';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { flashcards } from '../src/db/schema';
import {
  verifyQuestionWithAI,
  validateQuestionStructure,
  RawAlocQuestion,
} from '../src/services/question-guard';

dotenv.config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL || process.env.DIRECT_URL;
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const ALOC_TOKEN = process.env.ALOC_ACCESS_TOKEN || process.env.NEXT_PUBLIC_ALOC_TOKEN;

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const limitIndex = args.indexOf('--limit');
const LIMIT = limitIndex !== -1 ? parseInt(args[limitIndex + 1] || '20') : 20;

const subjectIndex = args.indexOf('--subject');
const TARGET_SUBJECT = subjectIndex !== -1 ? args[subjectIndex + 1] : 'english';

async function main() {
  console.log('================================================================');
  console.log(' 🛡️  JAMB SCHOLAR — 20K QUESTION INTEGRITY & VERIFICATION GUARD');
  console.log('================================================================');
  console.log(`• Target Subject: ${TARGET_SUBJECT}`);
  console.log(`• Batch Limit:    ${LIMIT} questions`);
  console.log(`• Mode:           ${DRY_RUN ? 'DRY-RUN (No DB write)' : 'LIVE INGESTION'}`);
  console.log('----------------------------------------------------------------\n');

  if (!DATABASE_URL && !DRY_RUN) {
    console.error('❌ Error: DATABASE_URL is not set in .env.local');
    process.exit(1);
  }

  const sql = DATABASE_URL ? postgres(DATABASE_URL, { prepare: false }) : null;
  const db = sql ? drizzle(sql) : null;

  try {
    // 1. Fetch sample questions from ALOC API or local mock
    console.log(`📥 Fetching questions from ALOC for subject [${TARGET_SUBJECT}]...`);
    let rawQuestions: RawAlocQuestion[] = [];

    if (ALOC_TOKEN) {
      try {
        const res = await fetch(`https://questions.aloc.com.ng/api/v2/q/${LIMIT}?subject=${TARGET_SUBJECT}`, {
          headers: {
            Accept: 'application/json',
            AccessToken: ALOC_TOKEN,
          },
        });
        const data = await res.json();
        rawQuestions = (data.data || []).map((q: any) => ({
          id: q.id,
          question: q.question,
          option: q.option,
          answer: q.answer,
          solution: q.solution,
          subject: TARGET_SUBJECT,
          examyear: q.examyear,
        }));
      } catch (err) {
        console.warn('⚠️ Could not connect to live ALOC API, using local fallback sample questions.');
      }
    }

    if (rawQuestions.length === 0) {
      // Local seed sample for testing
      rawQuestions = [
        {
          id: 101,
          question: '<p>The committee agreed that each of the participants &nbsp;_______ eligible for a grant.</p>',
          option: {
            a: 'was',
            b: 'were',
            c: 'are',
            d: 'have been',
          },
          answer: 'a',
          solution: 'Indefinite pronoun "each" takes a singular verb.',
          subject: 'english',
        },
        {
          id: 102,
          question: 'If a body of mass 5kg accelerates at 2m/s², what is the resultant force?',
          option: {
            a: '10 N',
            b: '2.5 N',
            c: '7 N',
            d: '10 N', // Intentional duplicate to test Guard Layer 1
          },
          answer: 'a',
          subject: 'physics',
        },
      ];
    }

    console.log(`🔎 Received ${rawQuestions.length} raw questions. Running Integrity Guard...\n`);

    let passedCount = 0;
    let correctedCount = 0;
    let quarantinedCount = 0;

    for (let i = 0; i < rawQuestions.length; i++) {
      const raw = rawQuestions[i];
      console.log(`[Card ${i + 1}/${rawQuestions.length}] Checking Question #${raw.id || i + 1}...`);

      const result = await verifyQuestionWithAI(raw, GEMINI_KEY);

      if (result.status === 'VERIFIED_CORRECT') {
        console.log(`  ✅ STATUS: VERIFIED_CORRECT (Confidence: ${result.confidenceScore}%)`);
        console.log(`  📖 Textbook: ${result.textbookCitation}`);
        console.log(`  💡 Socratic: ${result.socraticExplanation}`);
        passedCount++;
      } else if (result.status === 'CORRECTED_BY_AI') {
        console.log(`  ⚠️ STATUS: CORRECTED_BY_AI — ${result.discrepancyNote}`);
        console.log(`  💡 Socratic: ${result.socraticExplanation}`);
        correctedCount++;
      } else {
        console.log(`  ⛔ STATUS: ${result.status} — ${result.discrepancyNote || 'Failed integrity check'}`);
        console.log(`  🚨 Action: QUARANTINED (Excluded from student drills)`);
        quarantinedCount++;
      }

      if (result.isApprovedForStudents && db && !DRY_RUN) {
        // Safe write to database flashcards
        await db.insert(flashcards).values({
          subject: raw.subject || TARGET_SUBJECT,
          topicSlug: (raw.subject || TARGET_SUBJECT) + '-verified',
          cardType: 'interactive_drill',
          frontPrompt: result.cleanedQuestion,
          backAnswer: result.options.find((o) => o.isCorrect)?.text || '',
          options: result.options,
          socraticHint: result.socraticExplanation,
          textbookRef: result.textbookCitation,
          srsEaseFactor: 250,
        });
      }

      console.log('');
      // Polite rate limit backoff
      await new Promise((res) => setTimeout(res, 300));
    }

    console.log('================================================================');
    console.log(' 📊 INTEGRITY GUARD AUDIT SUMMARY');
    console.log('================================================================');
    console.log(`• Total Processed: ${rawQuestions.length}`);
    console.log(`• Verified Correct: ${passedCount}`);
    console.log(`• AI-Corrected Keys: ${correctedCount}`);
    console.log(`• Quarantined / Excluded: ${quarantinedCount}`);
    console.log('================================================================\n');

  } catch (error) {
    console.error('❌ Pipeline error:', error);
  } finally {
    if (sql) await sql.end();
  }
}

main();
