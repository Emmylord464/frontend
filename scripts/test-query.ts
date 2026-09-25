import 'dotenv/config';
import postgres from 'postgres';

async function checkRows() {
  const url = process.env.DATABASE_URL!;
  const sql = postgres(url, { prepare: false });

  try {
    const topicCount = await sql`SELECT count(*) FROM syllabus_topics`;
    console.log('Total topics in syllabus_topics:', topicCount[0].count);

    const topicsBySubj = await sql`SELECT subject, count(*) FROM syllabus_topics GROUP BY subject`;
    console.log('Topics by subject:', topicsBySubj);

    const columns = await sql`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'syllabus_topics'
    `;
    console.log('Columns in syllabus_topics:', columns);

    const testQuery = await sql`
      select "id", "subject", "topic_name", "sub_topic_name", "objectives", "question_weight", "order_index", "exam_year", "prescribed_novel_id" 
      from "syllabus_topics" 
      where "syllabus_topics"."subject" = 'MATHEMATICS' 
      order by "syllabus_topics"."order_index"
    `;
    console.log('Test query succeeded, rows:', testQuery.length);
  } catch (err: any) {
    console.error('Query error:', err);
  } finally {
    await sql.end();
  }
}

checkRows();

