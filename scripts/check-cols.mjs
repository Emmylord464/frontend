import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL, { prepare: false });

const cols = await sql`
  SELECT column_name, data_type
  FROM information_schema.columns
  WHERE table_name = 'past_questions'
  ORDER BY ordinal_position
`;
console.log('past_questions columns:');
cols.forEach(c => console.log(' ', c.column_name, '-', c.data_type));

const topicCols = await sql`
  SELECT column_name, data_type
  FROM information_schema.columns
  WHERE table_name = 'syllabus_topics'
  ORDER BY ordinal_position
`;
console.log('\nsyllabus_topics columns:');
topicCols.forEach(c => console.log(' ', c.column_name, '-', c.data_type));

await sql.end();

