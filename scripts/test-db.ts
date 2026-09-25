import 'dotenv/config';
import postgres from 'postgres';

async function check() {
  const url = process.env.DATABASE_URL;
  console.log('Connecting with URL:', url ? url.replace(/:[^:@]+@/, ':***@') : 'NONE');
  if (!url) {
    console.error('DATABASE_URL is missing!');
    process.exit(1);
  }

  const sql = postgres(url, { prepare: false });
  try {
    const test = await sql`SELECT 1 as connected`;
    console.log('Connected successfully:', test);

    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('Tables found in database:', tables.map(t => t.table_name));

    const checkTopics = await sql`
      SELECT count(*) FROM information_schema.tables WHERE table_name = 'syllabus_topics'
    `;
    console.log('syllabus_topics exists:', checkTopics);
  } catch (err: any) {
    console.error('Database connection error message:', err.message);
    console.error('Error code:', err.code);
    console.error('Full error:', err);
  } finally {
    await sql.end();
  }
}

check();

