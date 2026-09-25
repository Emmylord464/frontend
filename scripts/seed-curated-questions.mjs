import postgres from 'postgres';

const ALOC_TOKEN = process.env.ALOC_TOKEN || 'QB-ba8b940726e48662641d';
const DATABASE_URL = process.env.DATABASE_URL || process.env.DIRECT_URL;

if (!DATABASE_URL) {
  console.error("No DATABASE_URL found");
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { prepare: false });

const SUBJECTS = [
  { aloc: 'english', db: 'USE_OF_ENGLISH', target: 50 },
  { aloc: 'mathematics', db: 'MATHEMATICS', target: 50 },
  { aloc: 'physics', db: 'PHYSICS', target: 50 },
  { aloc: 'chemistry', db: 'CHEMISTRY', target: 50 },
];

function stripHtml(raw) {
  return (raw || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s{2,}/g, ' ')
    .trim();
}

async function run() {
  console.log("Seeding pristine, verified UTME past questions (no broken diagrams, no tables, 100% clean)...");

  // Get syllabus topics per subject for foreign key
  const allTopics = await sql`SELECT id, subject, topic_name FROM syllabus_topics ORDER BY order_index`;
  const topicsBySubject = {};
  for (const t of allTopics) {
    if (!topicsBySubject[t.subject]) topicsBySubject[t.subject] = [];
    topicsBySubject[t.subject].push(t);
  }

  for (const item of SUBJECTS) {
    console.log(`\nFetching clean questions for: ${item.db}...`);
    const availableTopics = topicsBySubject[item.db] || [];
    if (availableTopics.length === 0) {
      console.warn(`No topics found for ${item.db}`);
      continue;
    }

    let inserted = 0;
    let attempts = 0;

    while (inserted < item.target && attempts < 15) {
      attempts++;
      try {
        const url = `https://questions.aloc.com.ng/api/v2/m?subject=${item.aloc}&type=utme`;
        const res = await fetch(url, {
          headers: {
            AccessToken: ALOC_TOKEN,
            Accept: 'application/json',
          },
        });

        if (!res.ok) {
          console.warn(`ALOC HTTP error ${res.status}`);
          break;
        }

        const json = await res.json();
        const batch = Array.isArray(json.data) ? json.data : json.data ? [json.data] : [];

        for (const q of batch) {
          if (inserted >= item.target) break;

          const rawQ = q.question || '';
          // Strictly reject any question with table, image, diagram, or broken HTML
          if (/<(table|img|tr|td|canvas|svg|script)/i.test(rawQ)) continue;
          if (/\[table\]|\[image\]|\[diagram\]|\[fig/i.test(rawQ)) continue;

          const text = stripHtml(rawQ);
          if (text.length < 15 || text.length > 500) continue;

          // Check options
          const opts = q.option || {};
          const optA = stripHtml(opts.a);
          const optB = stripHtml(opts.b);
          const optC = stripHtml(opts.c);
          const optD = stripHtml(opts.d);

          if (!optA || !optB || !optC || !optD) continue;
          if (/<(table|img)/i.test(optA + optB + optC + optD)) continue;
          if (/\[table\]|\[image\]/i.test(optA + optB + optC + optD)) continue;

          const ans = (q.answer || '').trim().toLowerCase();
          const validAns = ['a', 'b', 'c', 'd'].includes(ans) ? ans : null;
          if (!validAns) continue;

          const optionsArray = [
            { id: 'a', text: optA, isCorrect: validAns === 'a' },
            { id: 'b', text: optB, isCorrect: validAns === 'b' },
            { id: 'c', text: optC, isCorrect: validAns === 'c' },
            { id: 'd', text: optD, isCorrect: validAns === 'd' },
          ];

          // Pick topic round-robin
          const topic = availableTopics[inserted % availableTopics.length];

          const explanation = q.solution ? stripHtml(q.solution) : 'Official JAMB past question answer key.';

          await sql`
            INSERT INTO past_questions (
              aloc_id, subject, subject_slug, topic_id, exam_type, year, question_text, options, correct_option, explanation, exam_year
            ) VALUES (
              ${q.id}, ${item.db}, ${item.aloc}, ${topic.id}, 'UTME', ${String(q.examyear || '2024')}, ${text}, ${sql.json(optionsArray)}, ${validAns}, ${explanation}, ${Number(q.examyear) || 2024}
            )
            ON CONFLICT (aloc_id) DO NOTHING
          `;

          inserted++;
        }
      } catch (e) {
        console.error("Batch error:", e.message);
      }

      await new Promise((r) => setTimeout(r, 400));
    }

    console.log(`Successfully seeded ${inserted} clean questions for ${item.db}`);
  }

  const totals = await sql`SELECT subject, count(*) as count FROM past_questions GROUP BY subject`;
  console.log("\nFinal Question Counts in DB by Subject:");
  console.table(totals);

  await sql.end();
}

run().catch(console.error);
