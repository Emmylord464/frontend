/**
 * ingest-node.mjs
 * Pure ESM — no TypeScript, no tsx compilation delay.
 * Node v24+: run with: node --env-file=.env scripts/ingest-node.mjs
 *
 * Ingests 250 UTME questions × 4 subjects = 1,000 total into Supabase.
 */

import postgres from 'postgres';

// ── Config ────────────────────────────────────────────────────────────────────

const DATABASE_URL = process.env.DATABASE_URL || process.env.DIRECT_URL;
const ALOC_TOKEN   = process.env.ALOC_TOKEN;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL missing. Run: node --env-file=.env scripts/ingest-node.mjs');
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { prepare: false });

const ALOC_BASE = 'https://questions.aloc.com.ng/api/v2/m';
const DELAY_MS  = 350;
const TARGET    = 250;

const SUBJECTS = [
  { aloc: 'english',     schema: 'USE_OF_ENGLISH', slug: 'english'     },
  { aloc: 'mathematics', schema: 'MATHEMATICS',    slug: 'mathematics'  },
  { aloc: 'physics',     schema: 'PHYSICS',        slug: 'physics'      },
  { aloc: 'chemistry',   schema: 'CHEMISTRY',      slug: 'chemistry'    },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function stripHtml(raw) {
  return String(raw ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\s{2,}/g, ' ').trim();
}

function normaliseAnswer(raw) {
  if (!raw) return null;
  const s = String(raw).trim().toLowerCase();
  if (/^[1-5]$/.test(s)) return String.fromCharCode(96 + parseInt(s)); // '1'→'a'
  const m = s.match(/[a-e]/);
  return m ? m[0] : null;
}

function cleanQuestion(q) {
  const questionText = stripHtml(q.question ?? '');
  if (questionText.length < 10) return null;

  const rawOpts = {};
  for (const [k, v] of Object.entries(q.option ?? {})) {
    const cleaned = stripHtml(v);
    if (cleaned.length > 0) rawOpts[k.toLowerCase()] = cleaned;
  }

  const valid = ['a','b','c','d'].filter(k => rawOpts[k]);
  if (valid.length < 3) return null;

  const correct = normaliseAnswer(q.answer);
  if (!correct || !rawOpts[correct]) return null;

  const options = Object.entries(rawOpts).map(([id, text]) => ({
    id,
    text,
    isCorrect: id === correct,
  }));

  // Enforce varchar column limits
  const correctOption = correct.slice(0, 1);        // varchar(10) — always single letter
  const yearRaw = String(q.examyear ?? 2024);
  const year = yearRaw.slice(0, 20);                // varchar(20)

  return {
    questionText,
    options,
    correctOption,
    explanation: q.solution ? stripHtml(q.solution) : 'Official JAMB answer key.',
    year,
    examYear: Number(q.examyear) || 2024,
  };
}

// ── DB helpers ────────────────────────────────────────────────────────────────

const topicCache = new Map();

async function getOrCreateTopic(subject, topicName) {
  const key = `${subject}::${topicName}`;
  if (topicCache.has(key)) return topicCache.get(key);

  const existing = await sql`
    SELECT id FROM syllabus_topics
    WHERE subject = ${subject} AND topic_name = ${topicName}
    LIMIT 1
  `;

  if (existing.length > 0) {
    topicCache.set(key, existing[0].id);
    return existing[0].id;
  }

  const inserted = await sql`
    INSERT INTO syllabus_topics
      (subject, topic_name, sub_topic_name, objectives, question_weight, order_index, exam_year)
    VALUES
      (${subject}, ${topicName}, ${topicName},
       ${'Master all JAMB UTME questions on ' + topicName},
       ${'5.00%'}, ${topicCache.size + 1}, ${2026})
    ON CONFLICT DO NOTHING
    RETURNING id
  `;

  if (inserted.length > 0) {
    topicCache.set(key, inserted[0].id);
    return inserted[0].id;
  }

  // Race condition — fetch again
  const retry = await sql`
    SELECT id FROM syllabus_topics
    WHERE subject = ${subject} AND topic_name = ${topicName}
    LIMIT 1
  `;
  topicCache.set(key, retry[0].id);
  return retry[0].id;
}

// ── ALOC fetch ────────────────────────────────────────────────────────────────

async function fetchBatch(subject) {
  const url = `${ALOC_BASE}?subject=${encodeURIComponent(subject)}&type=utme`;
  const headers = { Accept: 'application/json' };
  if (ALOC_TOKEN) headers['AccessToken'] = ALOC_TOKEN;

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`ALOC ${res.status}: ${await res.text().then(t => t.slice(0,100))}`);

  const json = await res.json();
  if (!json.data) return [];
  return Array.isArray(json.data) ? json.data : [json.data];
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 ALOC UTME Ingestion — 250 × 4 subjects = 1,000 questions\n');

  let grandTotal = 0;
  let grandSkipped = 0;
  let grandRejected = 0;

  for (const subj of SUBJECTS) {
    console.log(`📚 Subject: ${subj.schema}`);

    // Pre-load existing topic IDs for this subject
    const existingTopics = await sql`
      SELECT id, topic_name FROM syllabus_topics WHERE subject = ${subj.schema}
    `;
    for (const t of existingTopics) {
      topicCache.set(`${subj.schema}::${t.topic_name}`, t.id);
    }
    console.log(`   Loaded ${existingTopics.length} existing topics`);

    let inserted = 0;
    let skipped  = 0;
    let rejected = 0;
    let attempts = 0;
    const maxAttempts = 60; // safety cap

    while (inserted < TARGET && attempts < maxAttempts) {
      attempts++;
      try {
        const batch = await fetchBatch(subj.aloc);
        if (batch.length === 0) { console.log('   ⚠️  Empty batch — stopping'); break; }

        for (const q of batch) {
          if (inserted >= TARGET) break;

          const clean = cleanQuestion(q);
          if (!clean) { rejected++; continue; }

          // Use section hint as topic name, or fallback
          const topicName = stripHtml(q.section ?? q.subsection ?? '') || `${subj.schema} General`;
          const topicId = await getOrCreateTopic(subj.schema, topicName);

          const result = await sql`
            INSERT INTO past_questions
              (aloc_id, subject, subject_slug, topic_id, exam_type,
               year, question_text, options, correct_option, explanation, exam_year)
            VALUES
              (${q.id}, ${subj.schema}, ${subj.slug}, ${topicId}, ${'UTME'},
               ${clean.year}, ${clean.questionText}, ${JSON.stringify(clean.options)},
               ${clean.correctOption}, ${clean.explanation}, ${clean.examYear})
            ON CONFLICT (aloc_id) DO NOTHING
            RETURNING id
          `;

          if (result.length > 0) inserted++;
          else skipped++;
        }

        console.log(`   [${subj.schema}] ${inserted}/${TARGET} inserted | skipped: ${skipped} | rejected: ${rejected}`);
      } catch (err) {
        console.error(`   ⚠️  Batch error (skipping): ${err.message}`);
        // continue to next batch attempt rather than stopping
      }

      await sleep(DELAY_MS);
    }

    grandTotal   += inserted;
    grandSkipped += skipped;
    grandRejected+= rejected;
    console.log(`   ✅ Done: ${inserted} inserted\n`);
  }

  console.log('═'.repeat(50));
  console.log(`🎉 Ingestion complete!`);
  console.log(`   Inserted : ${grandTotal}`);
  console.log(`   Skipped  : ${grandSkipped}  (duplicates)`);
  console.log(`   Rejected : ${grandRejected}  (quality check failed)`);
  console.log('═'.repeat(50));

  await sql.end();
  process.exit(0);
}

main().catch(err => {
  console.error('💥 Fatal:', err);
  process.exit(1);
});

