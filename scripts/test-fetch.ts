import 'dotenv/config';
import { fetchExamQuestionsAction } from '../src/actions/fetch-exam-questions';

async function run() {
  console.time('First fetch (parallel DB)');
  const res1 = await fetchExamQuestionsAction();
  console.timeEnd('First fetch (parallel DB)');

  if (res1.success) {
    console.log('Subjects fetched:', Object.keys(res1.questions));
    console.log(
      'Questions count per subject:',
      Object.entries(res1.questions).map(([k, v]) => `${k}: ${v.length}`)
    );
    // Check first question
    const sample = res1.questions.MATHEMATICS[0];
    console.log('Sample Math question:', sample?.questionText);
    console.log('Sample Math options:', sample?.options);
  }

  console.time('Second fetch (in-memory cached)');
  const res2 = await fetchExamQuestionsAction();
  console.timeEnd('Second fetch (in-memory cached)');

  process.exit(0);
}

run().catch(console.error);
