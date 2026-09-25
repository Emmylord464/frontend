import 'dotenv/config';

async function testAloc() {
  const token = process.env.ALOC_TOKEN;
  console.log('Testing ALOC with token:', token ? `${token.slice(0, 6)}...` : 'NONE');

  const url = 'https://questions.aloc.com.ng/api/v2/m?subject=english&type=utme';
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  if (token) headers['AccessToken'] = token;

  try {
    const res = await fetch(url, { headers });
    console.log('Status code:', res.status, res.statusText);
    const json = await res.json();
    console.log('Response status field:', json.status);
    console.log('Response message:', json.message);
    const questions = Array.isArray(json.data) ? json.data : json.data ? [json.data] : [];
    console.log(`Received ${questions.length} questions.`);
    if (questions.length > 0) {
      console.log('Sample question ID:', questions[0].id);
      console.log('Sample question snippet:', String(questions[0].question).slice(0, 80));
    }
  } catch (err: any) {
    console.error('Fetch error:', err.message);
  }
}

testAloc();

