import postgres from 'postgres';

const dbUrl = process.env.DATABASE_URL || process.env.DIRECT_URL;
if (!dbUrl) {
  console.error("No DATABASE_URL found");
  process.exit(1);
}

const sql = postgres(dbUrl, { prepare: false });

async function check() {
  const bySubject = await sql`SELECT subject, count(*) as count FROM past_questions GROUP BY subject`;
  console.log("By subject:", bySubject);
  const total = await sql`SELECT count(*) as total FROM past_questions`;
  console.log("Total questions in DB:", total[0].total);
  await sql.end();
}

check().catch(console.error);
