import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as dotenv from 'dotenv';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { Pinecone } from '@pinecone-database/pinecone';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { cards, courses, modules, pastQuestions, syllabusTopics } from '../src/db/schema';

dotenv.config({ path: '.env.local' });

type TrackCategory = 'JAMB_UTME' | 'PROGRAMMING' | 'HOW_TECH_WORKS' | 'DATA_ANALYTICS' | 'ARTIFICIAL_INTELLIGENCE' | 'CRYPTO_WEB3' | 'QUANTUM_COMPUTING';
type CardType = 'VISUAL_INTUITION' | 'SOCRATIC_PROBE' | 'TACTILE_CHECK' | 'CONCEPT_WIDGET' | 'MASTERY_CHECK';

export interface RawIngestionPayload {
  category: TrackCategory;
  subject: string;
  courseTitle: string;
  moduleTitle: string;
  nodeOrder: number;
  examYear?: number;
  sourceBook?: string;
  rawSyllabusText: string;
}

type GeneratedCard = {
  stepOrder: number;
  cardType: CardType;
  questionText: string;
  options: Array<{ id: string; text: string; isCorrect: boolean }>;
  explanation: string;
};

type GeneratedMcq = {
  questionText: string;
  options: Record<string, string>;
  correctOption: string;
  explanation: string;
};

const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
const nvidiaApiKey = process.env.NVIDIA_API_KEY;
const pineconeApiKey = process.env.PINECONE_API_KEY;
const nvidiaBaseUrl = process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1';
const chatModel = process.env.NVIDIA_CHAT_MODEL || 'meta/llama-3.3-70b-instruct';
const embeddingModel = process.env.NVIDIA_EMBEDDING_MODEL || 'nvidia/nemotron-3-embed-1b';
const pineconeIndexName = process.env.PINECONE_INDEX_NAME || '';

if (!databaseUrl || !nvidiaApiKey) {
  throw new Error('Missing DATABASE_URL/DIRECT_URL or NVIDIA_API_KEY in .env.local');
}

const sql = postgres(databaseUrl, { prepare: false });
const db = drizzle(sql);
const llm = new ChatOpenAI({
  model: chatModel,
  apiKey: nvidiaApiKey,
  temperature: 0.2,
  configuration: { baseURL: nvidiaBaseUrl },
});
const embeddings = new OpenAIEmbeddings({
  model: embeddingModel,
  apiKey: nvidiaApiKey,
  configuration: { baseURL: nvidiaBaseUrl },
});
const pinecone = pineconeApiKey && pineconeIndexName ? new Pinecone({ apiKey: pineconeApiKey }) : null;

function parseJson(content: unknown) {
  const raw = Array.isArray(content)
    ? content.map((part) => (typeof part === 'string' ? part : JSON.stringify(part))).join('')
    : String(content);
  return JSON.parse(raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim()) as {
    deck: GeneratedCard[];
    mcqs: GeneratedMcq[];
  };
}

export async function ingestCourseMaterial(payload: RawIngestionPayload) {
  if (!payload.rawSyllabusText.trim()) throw new Error('rawSyllabusText is required.');

  const prompt = `You are an expert Nigerian EdTech instructional designer and exam specialist.
Transform the supplied material into exactly one five-card interactive deck and three exam-grade MCQs.
Return only valid JSON with this shape:
{
  "deck": [{ "stepOrder": 1, "cardType": "VISUAL_INTUITION", "questionText": "...", "options": [{"id":"a","text":"...","isCorrect":true},{"id":"b","text":"...","isCorrect":false},{"id":"c","text":"...","isCorrect":false},{"id":"d","text":"...","isCorrect":false}], "explanation": "..." }],
  "mcqs": [{ "questionText": "...", "options": {"A":"...","B":"...","C":"...","D":"..."}, "correctOption": "A", "explanation": "..." }]
}
Use only facts present in the material. Make cards progress from intuition to mastery, and keep all questions suitable for Nigerian learners.

Material:
${payload.rawSyllabusText}`;

  const response = await llm.invoke([{ role: 'user', content: prompt }]);
  const generated = parseJson(response.content);
  if (generated.deck.length !== 5 || generated.mcqs.length !== 3) {
    throw new Error('NVIDIA returned an invalid deck or MCQ count.');
  }

  const [course] = await db.insert(courses).values({
    category: payload.category,
    subject: payload.subject,
    title: payload.courseTitle,
    description: `Interactive micro-learning course on ${payload.courseTitle}`,
    iconName: payload.category === 'JAMB_UTME' ? 'book-open' : 'code-2',
  }).returning({ id: courses.id });
  const [moduleNode] = await db.insert(modules).values({
    courseId: course.id,
    title: payload.moduleTitle,
    nodeOrder: payload.nodeOrder,
    examYear: payload.examYear ?? null,
  }).returning({ id: modules.id });

  await db.insert(cards).values(generated.deck.map((card, index) => ({
    moduleId: moduleNode.id,
    cardType: card.cardType,
    stepOrder: index + 1,
    questionText: card.questionText,
    contentPayload: {
      options: card.options,
      explanation: card.explanation,
      subject: payload.subject,
      topic: payload.moduleTitle,
      examYear: payload.examYear,
      sourceBook: payload.sourceBook,
    },
  })));

  if (payload.category === 'JAMB_UTME') {
    const subject = payload.subject as typeof syllabusTopics.$inferInsert.subject;
    const [topic] = await db.insert(syllabusTopics).values({
      subject,
      topicName: payload.moduleTitle,
      subTopicName: payload.sourceBook || payload.moduleTitle,
      objectives: `Master ${payload.moduleTitle} for ${payload.examYear ?? 2026} UTME.`,
      examYear: payload.examYear ?? 2026,
    }).returning({ id: syllabusTopics.id });
    await db.insert(pastQuestions).values(generated.mcqs.map((mcq) => ({
      topicId: topic.id,
      moduleId: moduleNode.id,
      year: String(payload.examYear ?? 2026),
      questionText: mcq.questionText,
      options: mcq.options,
      correctOption: mcq.correctOption.slice(0, 1),
      explanation: mcq.explanation,
      examYear: payload.examYear ?? 2026,
    })));
  }

  let vectorsSynced = false;
  if (pinecone) {
    const index = pinecone.Index(pineconeIndexName);
    const content = `${payload.category} > ${payload.subject} > ${payload.moduleTitle} > ${payload.examYear ?? 'TECH'}\n${payload.sourceBook || ''}\n${payload.rawSyllabusText}`;
    const vector = await embeddings.embedQuery(content);
    await index.upsert({ records: [{
      id: `module-${moduleNode.id}`,
      values: vector,
      metadata: {
        category: payload.category,
        subject: payload.subject,
        topic: payload.moduleTitle,
        subtopic: payload.moduleTitle,
        examYear: payload.examYear ?? 0,
        sourceBook: payload.sourceBook || '',
        content,
      },
    }] });
    vectorsSynced = true;
  }

  return { courseId: course.id, moduleId: moduleNode.id, cardCount: generated.deck.length, mcqCount: generated.mcqs.length, vectorsSynced };
}

async function main() {
  const inputPath = process.argv[2] || 'data/raw-syllabus.json';
  const payload = JSON.parse(await fs.readFile(path.resolve(inputPath), 'utf8')) as RawIngestionPayload;
  console.log(await ingestCourseMaterial(payload));
}

if (process.argv[1]?.endsWith('ingest-course-material.ts')) {
  main().catch((error) => {
    console.error('Course ingestion failed:', error);
    process.exitCode = 1;
  }).finally(() => sql.end());
}
