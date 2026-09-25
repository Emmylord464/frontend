'use server';

import { Pinecone } from '@pinecone-database/pinecone';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';

const pineconeApiKey = process.env.PINECONE_API_KEY;
const nvidiaApiKey = process.env.NVIDIA_API_KEY;
const nvidiaBaseUrl = process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1';
const embeddingModel = process.env.NVIDIA_EMBEDDING_MODEL || 'nvidia/nemotron-3-embed-1b';
const chatModel = process.env.NVIDIA_CHAT_MODEL || 'meta/llama-3.3-70b-instruct';
const indexName = process.env.PINECONE_INDEX_NAME || '';

if (!pineconeApiKey || !nvidiaApiKey || !indexName) {
  throw new Error('Missing Pinecone or NVIDIA configuration.');
}

const pinecone = new Pinecone({ apiKey: pineconeApiKey });
const embeddings = new OpenAIEmbeddings({
  model: embeddingModel,
  apiKey: nvidiaApiKey,
  configuration: { baseURL: nvidiaBaseUrl },
});
const model = new ChatOpenAI({
  model: chatModel,
  apiKey: nvidiaApiKey,
  temperature: 0.3,
  configuration: { baseURL: nvidiaBaseUrl },
});

export async function askSocraticTutorAction(
  studentQuestion: string,
  subject: string,
  topic: string,
) {
  const question = studentQuestion.trim();
  const selectedSubject = subject.trim();
  const selectedTopic = topic.trim();

  if (!question || !selectedSubject || !selectedTopic || question.length > 2000) {
    return { success: false, error: 'Provide a valid question, subject, and topic.' };
  }

  try {
    const queryVector = await embeddings.embedQuery(question);
    const index = pinecone.Index(indexName);
    const queryResponse = await index.query({
      vector: queryVector,
      topK: 2,
      includeMetadata: true,
      filter: {
        subject: { $eq: selectedSubject },
        topic: { $eq: selectedTopic },
      },
    });

    const contextText = queryResponse.matches
      .map((match) => match.metadata?.content)
      .filter((content): content is string => typeof content === 'string')
      .join('\n\n');

    const systemPrompt = `You are Jamby, a warm, energetic, and highly encouraging AI Learning Companion preparing Nigerian students for their JAMB UTME exams and tech careers.

  YOUR PERSONALITY & RULES:
  1. IDENTITY: Introduce yourself as Jamby whenever appropriate ("Hi! I'm Jamby, your UTME study buddy.").
  2. STRICT SOCRATIC METHOD: Never reveal the direct answer option (A, B, C, or D) outright.
  3. GROUNDING: Ground your hints strictly in the provided syllabus context:
  ${contextText || 'General JAMB IBASS Syllabus & Recommended Textbooks.'}

  4. GUIDANCE STYLE:
     - State the relevant core principle, formula (e.g., v = u + at), or literary fact (e.g., Mr. Adebepo in 'The Lekki Headmaster').
     - Ask 1 concise, targeted follow-up question that leads the student to the answer themselves.
  5. TONE: Supportive, clear, and tailored to Nigerian secondary school candidates. Keep responses under 3 sentences for mobile readability.`;

    const response = await model.invoke([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: question },
    ]);

    return { success: true, answer: String(response.content) };
  } catch (error) {
    console.error('AI Tutor Error:', error);
    return { success: false, error: 'Failed to generate tutor response.' };
  }
}
