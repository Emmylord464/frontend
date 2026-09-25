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

type PhaseDeck = {
  category: 'JAMB_UTME' | 'PROGRAMMING' | 'HOW_TECH_WORKS' | 'DATA_ANALYTICS' | 'ARTIFICIAL_INTELLIGENCE' | 'CRYPTO_WEB3' | 'QUANTUM_COMPUTING';
  subject: string;
  courseTitle: string;
  moduleTitle: string;
  historicalWeight: number;
  isHighYield: boolean;
  deck: Array<{
    stepOrder: number;
    cardType: 'VISUAL_INTUITION' | 'SOCRATIC_PROBE' | 'TACTILE_CHECK' | 'CONCEPT_WIDGET' | 'MASTERY_CHECK';
    questionText: string;
    options: Array<{ id: string; text: string; isCorrect: boolean }>;
    explanation: string;
  }>;
};

const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pineconeApiKey = process.env.PINECONE_API_KEY;
const nvidiaApiKey = process.env.NVIDIA_API_KEY;
const pineconeIndexName = process.env.PINECONE_INDEX_NAME || '';
const pineconeVectorDimension = Number(process.env.PINECONE_VECTOR_DIMENSION || '1024');
const nvidiaBaseUrl = process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1';
const embeddingModel = process.env.NVIDIA_EMBEDDING_MODEL || 'nvidia/nemotron-3-embed-1b';

if (!databaseUrl || !pineconeApiKey || !nvidiaApiKey || !pineconeIndexName) {
  throw new Error('Missing DATABASE_URL/DIRECT_URL, Pinecone, or NVIDIA configuration in .env.local');
}

const sql = postgres(databaseUrl, { prepare: false });
const db = drizzle(sql);
const pinecone = new Pinecone({ apiKey: pineconeApiKey });
const embeddings = new OpenAIEmbeddings({
  model: embeddingModel,
  apiKey: nvidiaApiKey,
  configuration: { baseURL: nvidiaBaseUrl },
});

function stableId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function ensureIndex() {
  const indexes = await pinecone.listIndexes();
  if (!indexes.indexes?.some((index) => index.name === pineconeIndexName)) {
    await pinecone.createIndex({
      name: pineconeIndexName,
      dimension: pineconeVectorDimension,
      metric: 'cosine',
      spec: { serverless: { cloud: 'aws', region: 'us-east-1' } },
    });
  }
}

async function seed() {
  const source = await fs.readFile(path.resolve('data/phase1-decks.json'), 'utf8');
  const decks = JSON.parse(source) as PhaseDeck[];
  await ensureIndex();
  const index = pinecone.Index(pineconeIndexName);
  const courseIds = new Map<string, string>();
  let cardsProcessed = 0;

  for (const deck of decks) {
    const courseKey = `${deck.category}:${deck.courseTitle}`;
    let courseId = courseIds.get(courseKey);
    if (!courseId) {
      const existing = await db.select({ id: courses.id }).from(courses).where(
        and(eq(courses.category, deck.category), eq(courses.title, deck.courseTitle)),
      ).limit(1);
      if (existing[0]) {
        courseId = existing[0].id;
        await db.update(courses).set({ subject: deck.subject }).where(eq(courses.id, courseId));
      } else {
        const [created] = await db.insert(courses).values({
          category: deck.category,
          subject: deck.subject,
          title: deck.courseTitle,
          description: `${deck.courseTitle} Phase 1 high-yield interactive track.`,
          iconName: deck.category === 'PROGRAMMING' ? 'code-2' : 'book-open',
        }).returning({ id: courses.id });
        courseId = created.id;
      }
      courseIds.set(courseKey, courseId);
    }

    const existingModule = await db.select({ id: modules.id }).from(modules).where(
      and(eq(modules.courseId, courseId), eq(modules.title, deck.moduleTitle)),
    ).limit(1);
    let moduleId = existingModule[0]?.id;
    if (!moduleId) {
      const [created] = await db.insert(modules).values({
        courseId,
        title: deck.moduleTitle,
        nodeOrder: Number(deck.moduleTitle.match(/Node (\d+)/i)?.[1] || 1),
        examYear: deck.category === 'JAMB_UTME' ? 2026 : null,
        historicalWeight: deck.historicalWeight,
        isHighYield: deck.isHighYield,
      }).returning({ id: modules.id });
      moduleId = created.id;
    } else {
      await db.update(modules).set({
        historicalWeight: deck.historicalWeight,
        isHighYield: deck.isHighYield,
      }).where(eq(modules.id, moduleId));
    }

    for (const card of deck.deck) {
      const existingCard = await db.select({ id: cards.id }).from(cards).where(
        and(eq(cards.moduleId, moduleId), eq(cards.stepOrder, card.stepOrder)),
      ).limit(1);
      if (!existingCard[0]) {
        await db.insert(cards).values({
          moduleId,
          cardType: card.cardType,
          stepOrder: card.stepOrder,
          questionText: card.questionText,
          contentPayload: {
            subject: deck.subject,
            topic: deck.moduleTitle,
            historicalWeight: deck.historicalWeight,
            isHighYield: deck.isHighYield,
            options: card.options,
            explanation: card.explanation,
          },
        });
      }

      const content = `${deck.category} > ${deck.subject} > ${deck.moduleTitle}\n${card.questionText}\n${card.explanation}`;
      const vector = await embeddings.embedQuery(content);
      if (vector.length !== pineconeVectorDimension) {
        throw new Error(`Embedding dimension mismatch: ${vector.length} received, ${pineconeVectorDimension} expected.`);
      }
      await index.upsert({ records: [{
        id: `phase1-${stableId(deck.subject)}-${stableId(deck.moduleTitle)}-${card.stepOrder}`,
        values: vector,
        metadata: {
          category: deck.category,
          subject: deck.subject,
          topic: deck.moduleTitle,
          examYear: deck.category === 'JAMB_UTME' ? 2026 : 0,
          historicalWeight: deck.historicalWeight,
          isHighYield: deck.isHighYield,
          content,
        },
      }] });
      cardsProcessed += 1;
    }
  }

  console.log(`Seed complete: ${decks.length} modules and ${cardsProcessed} cards synced.`);
}

seed().catch((error) => {
  console.error('Deck seed failed:', error);
  process.exitCode = 1;
}).finally(() => sql.end());
