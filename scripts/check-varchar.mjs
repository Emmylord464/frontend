// Checks which varchar columns in past_questions have a 255 char limit
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL, { prepare: false });

const cols = await sql`
  SELECT column_name, character_maximum_length
  FROM information_schema.columns
  WHERE table_name = 'past_questions'
  AND character_maximum_length IS NOT NULL
  ORDER BY column_name
`;

console.log('varchar column limits in past_questions:');
cols.forEach(c => console.log(`  ${c.column_name}: max ${c.character_maximum_length} chars`));

// Also check current count per subject
const counts = await sql`
  SELECT subject, COUNT(*) as count
  FROM past_questions
  GROUP BY subject
  ORDER BY subject
`;
console.log('\nCurrent DB counts:');
counts.forEach(r => console.log(`  ${r.subject}: ${r.count}`));

await sql.end();

