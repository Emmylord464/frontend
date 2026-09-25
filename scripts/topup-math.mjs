/**
 * topup-math.mjs
 * Tops up MATHEMATICS to 250 questions. Run once after main ingestion.
 */

import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL || process.env.DIRECT_URL;
if (!DATABASE_URL) { console.error('Missing DATABASE_URL'); process.exit(1); }

const sql = postgres(DATABASE_URL, { prepare: false });

const ALOC_BASE = 'https://questions.aloc.com.ng/api/v2/m';
const DELAY_MS  = 350;
const TARGET    = 250;
const SUBJECT   = { aloc: 'mathematics', schema: 'MATHEMATICS', slug: 'mathematics' };

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
  if (/^[1-5]$/.test(s)) return String.fromCharCode(96 + parseInt(s));
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

  const options = Object.entries(rawOpts).map(([id, text]) => ({ id, text, isCorrect: id === correct }));

  return {
    questionText,
    options,
    correctOption: correct.slice(0, 1),           // varchar(10) safe
    explanation: q.solution ? stripHtml(q.solution) : 'Official JAMB answer key.',
    year: String(q.examyear ?? 2024).slice(0, 20), // varchar(20) safe
    examYear: Number(q.examyear) || 2024,
  };
}

const topicCache = new Map();

async function getOrCreateTopic(topicName) {
  const key = `MATHEMATICS::${topicName}`;
  if (topicCache.has(key)) return topicCache.get(key);

  const existing = await sql`
    SELECT id FROM syllabus_topics WHERE subject = 'MATHEMATICS' AND topic_name = ${topicName} LIMIT 1
  `;
  if (existing.length > 0) { topicCache.set(key, existing[0].id); return existing[0].id; }

  const inserted = await sql`
    INSERT INTO syllabus_topics (subject, topic_name, sub_topic_name, objectives, question_weight, order_index, exam_year)
    VALUES ('MATHEMATICS', ${topicName}, ${topicName}, ${'Master all JAMB UTME questions on ' + topicName}, '5.00%', ${topicCache.size + 50}, 2026)
    ON CONFLICT DO NOTHING RETURNING id
  `;
  if (inserted.length > 0) { topicCache.set(key, inserted[0].id); return inserted[0].id; }

  const retry = await sql`SELECT id FROM syllabus_topics WHERE subject = 'MATHEMATICS' AND topic_name = ${topicName} LIMIT 1`;
  topicCache.set(key, retry[0].id);
  return retry[0].id;
}

async function main() {
  // Load current count
  const [{ count }] = await sql`SELECT COUNT(*)::int as count FROM past_questions WHERE subject = 'MATHEMATICS'`;
  console.log(`📊 Current MATHEMATICS count: ${count}`);
  if (count >= TARGET) { console.log('✅ Already at target!'); await sql.end(); return; }

  // Pre-load topics
  const existingTopics = await sql`SELECT id, topic_name FROM syllabus_topics WHERE subject = 'MATHEMATICS'`;
  existingTopics.forEach(t => topicCache.set(`MATHEMATICS::${t.topic_name}`, t.id));

  let inserted = 0;
  let skipped = 0;
  let attempts = 0;
  const needed = TARGET - count;
  console.log(`🎯 Need ${needed} more questions\n`);

  while (inserted < needed && attempts < 80) {
    attempts++;
    try {
      const url = `${ALOC_BASE}?subject=mathematics&type=utme`;
      const headers = { Accept: 'application/json' };
      if (process.env.ALOC_TOKEN) headers['AccessToken'] = process.env.ALOC_TOKEN;

      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`ALOC ${res.status}`);
      const json = await res.json();
      const batch = Array.isArray(json.data) ? json.data : json.data ? [json.data] : [];
      if (batch.length === 0) { console.log('⚠️  Empty batch'); break; }

      for (const q of batch) {
        if (inserted >= needed) break;
        const clean = cleanQuestion(q);
        if (!clean) continue;

        const topicName = stripHtml(q.section ?? q.subsection ?? '') || 'MATHEMATICS General';
        const topicId = await getOrCreateTopic(topicName);

        const result = await sql`
          INSERT INTO past_questions
            (aloc_id, subject, subject_slug, topic_id, exam_type, year, question_text, options, correct_option, explanation, exam_year)
          VALUES
            (${q.id}, 'MATHEMATICS', 'mathematics', ${topicId}, 'UTME',
             ${clean.year}, ${clean.questionText}, ${JSON.stringify(clean.options)},
             ${clean.correctOption}, ${clean.explanation}, ${clean.examYear})
          ON CONFLICT (aloc_id) DO NOTHING RETURNING id
        `;
        if (result.length > 0) inserted++;
        else skipped++;
      }

      console.log(`  [MATHEMATICS] +${inserted}/${needed} new | skipped: ${skipped}`);
    } catch (err) {
      console.error(`  ⚠️  Batch error (skipping): ${err.message}`);
    }
    await sleep(DELAY_MS);
  }

  const [{ count: finalCount }] = await sql`SELECT COUNT(*)::int as count FROM past_questions WHERE subject = 'MATHEMATICS'`;
  console.log(`\n✅ MATHEMATICS top-up complete: ${finalCount} total in DB`);
  await sql.end();
}

main().catch(err => { console.error('💥', err); process.exit(1); });

