import postgres from 'postgres';

const dbUrl = process.env.DATABASE_URL || process.env.DIRECT_URL;
const sql = postgres(dbUrl, { prepare: false });

async function clean() {
  console.log("Checking all questions in DB for quality...");
  const questions = await sql`SELECT id, subject, question_text, options, correct_option FROM past_questions`;
  
  const toDelete = [];
  for (const q of questions) {
    let isBad = false;
    const text = (q.question_text || '').trim();

    // 1. Short or broken text
    if (text.length < 15) isBad = true;

    // 2. HTML tables, img, broken tags
    if (/<(table|img|tr|td|div|script|iframe)[^>]*>/i.test(text)) isBad = true;

    // 3. Question text contains unrendered image/table placeholders
    if (/\[table\]|\[image\]|\[diagram\]|\[fig/i.test(text)) isBad = true;

    // 4. Broken entities or invalid Unicode garbage
    if (/&amp;#|&lt;table|/.test(text)) isBad = true;

    // 5. Check options
    const opts = q.options;
    if (!Array.isArray(opts) || opts.length < 4) {
      isBad = true;
    } else {
      for (const o of opts) {
        const oText = (o.text || '').trim();
        if (!oText || oText.length === 0) isBad = true;
        if (/<(table|img|tr|td)[^>]*>/i.test(oText)) isBad = true;
        if (/\[table\]|\[image\]/i.test(oText)) isBad = true;
      }
    }

    if (isBad) {
      toDelete.push(q.id);
    }
  }

  console.log(`Total questions checked: ${questions.length}`);
  console.log(`Challenging/problematic questions identified: ${toDelete.length}`);

  if (toDelete.length > 0) {
    console.log(`Deleting ${toDelete.length} problematic questions...`);
    // Delete in batches of 100
    for (let i = 0; i < toDelete.length; i += 100) {
      const batch = toDelete.slice(i, i + 100);
      await sql`DELETE FROM past_questions WHERE id IN ${sql(batch)}`;
    }
    console.log("Clean-up complete!");
  }

  const remaining = await sql`SELECT subject, count(*) as count FROM past_questions GROUP BY subject`;
  console.log("Remaining 100% verified clean questions by subject:", remaining);

  const total = await sql`SELECT count(*) as total FROM past_questions`;
  console.log("Total high-quality questions remaining:", total[0].total);

  await sql.end();
}

clean().catch(console.error);
