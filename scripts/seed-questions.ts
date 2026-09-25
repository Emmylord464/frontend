import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as dotenv from 'dotenv';
import postgres from 'postgres';
import { and, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';
import { cards, courses, modules } from '../src/db/schema';

dotenv.config({ path: '.env.local' });

type SeedCard = {
  category: 'JAMB_UTME' | 'PROGRAMMING' | 'HOW_TECH_WORKS' | 'DATA_ANALYTICS' | 'ARTIFICIAL_INTELLIGENCE' | 'CRYPTO_WEB3' | 'QUANTUM_COMPUTING';
  subject: string;
  courseTitle: string;
  moduleTitle: string;
  stepOrder: number;
  cardType: 'VISUAL_INTUITION' | 'SOCRATIC_PROBE' | 'TACTILE_CHECK' | 'CONCEPT_WIDGET' | 'MASTERY_CHECK';
  questionText: string;
  options: Array<{ id: string; text: string; isCorrect: boolean }>;
  explanation: string;
};

const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pineconeApiKey = process.env.PINECONE_API_KEY;
const nvidiaApiKey = process.env.NVIDIA_API_KEY;
const pineconeIndexName = process.env.PINECONE_INDEX_NAME || 'jamb-syllabus-index-nvidia';
const pineconeVectorDimension = Number(process.env.PINECONE_VECTOR_DIMENSION || '1024');
const nvidiaBaseUrl = process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1';
const nvidiaEmbeddingModel = process.env.NVIDIA_EMBEDDING_MODEL || 'nvidia/llama-nemotron-embed-vl-1b-v2';

if (!databaseUrl || !pineconeApiKey || !nvidiaApiKey) {
  throw new Error('Missing DIRECT_URL or DATABASE_URL, PINECONE_API_KEY, or NVIDIA_API_KEY in .env.local');
}

const sql = postgres(databaseUrl, { prepare: false });
const db = drizzle(sql);
const pinecone = new Pinecone({ apiKey: pineconeApiKey });
const embeddings = new OpenAIEmbeddings({
  model: nvidiaEmbeddingModel,
  apiKey: nvidiaApiKey,
  configuration: { baseURL: nvidiaBaseUrl },
});

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function ensurePineconeIndex() {
  const existingIndexes = await pinecone.listIndexes();
  const indexExists = existingIndexes.indexes?.some((index) => index.name === pineconeIndexName);

  if (!indexExists) {
    console.log(`Creating Pinecone index: ${pineconeIndexName} (dimension=${pineconeVectorDimension})`);
    await pinecone.createIndex({
      name: pineconeIndexName,
      dimension: pineconeVectorDimension,
      metric: 'cosine',
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1',
        },
      },
    });
  }
}

async function seed() {
  const seedPath = path.resolve(process.cwd(), 'data/multi-track-seed.json');
  const seedCards = JSON.parse(await fs.readFile(seedPath, 'utf8')) as SeedCard[];
  await ensurePineconeIndex();
  const index = pinecone.Index(pineconeIndexName);
  const courseIds = new Map<string, string>();
  const moduleIds = new Map<string, string>();

  for (const seedCard of seedCards) {
    const courseKey = `${seedCard.category}:${seedCard.courseTitle}`;
    let course = courseIds.has(courseKey)
      ? [{ id: courseIds.get(courseKey)! }]
      : await db.select({ id: courses.id }).from(courses).where(
          and(eq(courses.category, seedCard.category), eq(courses.title, seedCard.courseTitle)),
        ).limit(1);

    if (course.length === 0) {
      course = await db.insert(courses).values({
        category: seedCard.category,
        title: seedCard.courseTitle,
        description: `${seedCard.courseTitle} Phase 1 micro-card deck.`,
        iconName: seedCard.category === 'PROGRAMMING' ? 'code-2' : 'book-open',
      }).returning({ id: courses.id });
      console.log(`Created course: ${seedCard.courseTitle}`);
    }
    courseIds.set(courseKey, course[0].id);

    const moduleKey = `${course[0].id}:${seedCard.moduleTitle}`;
    let moduleRecord = moduleIds.has(moduleKey)
      ? [{ id: moduleIds.get(moduleKey)! }]
      : await db.select({ id: modules.id }).from(modules).where(
          and(eq(modules.courseId, course[0].id), eq(modules.title, seedCard.moduleTitle)),
        ).limit(1);

    if (moduleRecord.length === 0) {
      moduleRecord = await db.insert(modules).values({
        courseId: course[0].id,
        title: seedCard.moduleTitle,
        nodeOrder: 1,
      }).returning({ id: modules.id });
      console.log(`Created module: ${seedCard.moduleTitle}`);
    }
    moduleIds.set(moduleKey, moduleRecord[0].id);

    const existingCard = await db.select({ id: cards.id }).from(cards).where(
      and(eq(cards.moduleId, moduleRecord[0].id), eq(cards.stepOrder, seedCard.stepOrder)),
    ).limit(1);

    if (existingCard.length === 0) {
      await db.insert(cards).values({
        moduleId: moduleRecord[0].id,
        cardType: seedCard.cardType,
        stepOrder: seedCard.stepOrder,
        questionText: seedCard.questionText,
        contentPayload: {
          subject: seedCard.subject,
          options: seedCard.options,
          explanation: seedCard.explanation,
        },
      });
      console.log(`Inserted card: ${seedCard.moduleTitle} step ${seedCard.stepOrder}`);
    } else {
      console.log(`Card already exists: ${seedCard.moduleTitle} step ${seedCard.stepOrder}`);
    }

    const text = `${seedCard.courseTitle}\n${seedCard.moduleTitle}\n${seedCard.questionText}\n${seedCard.explanation}`;
    console.log(`Embedding: ${seedCard.subject} > ${seedCard.moduleTitle}`);
    const vector = await embeddings.embedQuery(text);

    if (vector.length !== pineconeVectorDimension) {
      throw new Error(`Embedding dimension mismatch: model produced ${vector.length} dimensions, index expects ${pineconeVectorDimension}`);
    }

    await index.upsert({
      records: [{
        id: `phase-1-${slugify(seedCard.category)}-${slugify(seedCard.moduleTitle)}-${seedCard.stepOrder}`,
        values: vector,
        metadata: {
          category: seedCard.category,
          subject: seedCard.subject,
          courseTitle: seedCard.courseTitle,
          topic: seedCard.moduleTitle,
          content: text,
          cardType: seedCard.cardType,
        },
      }],
    });
  }

  console.log(`Seed complete: ${seedCards.length} cards processed.`);
}

async function main() {
  try {
    await seed();
  } catch (error) {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  } finally {
    await sql.end();
  }
}

void main();
