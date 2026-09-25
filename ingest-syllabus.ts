import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const apiKey = process.env.PINECONE_API_KEY;
const nvidiaApiKey = process.env.NVIDIA_API_KEY;
const nvidiaBaseUrl = process.env.NVIDIA_BASE_URL || 'http://localhost:8000/v1';
const nvidiaEmbeddingModel = process.env.NVIDIA_EMBEDDING_MODEL || 'nvidia/llama-nemotron-embed-vl-1b-v2';
const indexName = process.env.PINECONE_INDEX_NAME || 'jamb-syllabus-index-nvidia';
const pineconeVectorDimension = Number(process.env.PINECONE_VECTOR_DIMENSION || '1024');

if (!apiKey || !nvidiaApiKey) {
  throw new Error('Missing PINECONE_API_KEY or NVIDIA_API_KEY in .env.local');
}

const pc = new Pinecone({ apiKey });
const embeddings = new OpenAIEmbeddings({
  model: nvidiaEmbeddingModel,
  apiKey: nvidiaApiKey,
  configuration: {
    baseURL: nvidiaBaseUrl,
  },
});

const sampleSyllabusChunks = [
  {
    id: 'syl-math-01',
    subject: 'MATHEMATICS',
    topic: 'Algebra',
    subtopic: 'Quadratic Equations',
    text: 'JAMB Mathematics Syllabus - Quadratic Equations: Solve quadratic equations by factorization, completing the square, and using the quadratic formula. Understand discriminant conditions for real distinct roots.',
  },
  {
    id: 'syl-phy-01',
    subject: 'PHYSICS',
    topic: 'Motion',
    subtopic: 'Linear Motion',
    text: 'JAMB Physics Syllabus - Motion: Equations of uniformly accelerated motion: v = u + at, s = ut + 0.5at^2, v^2 = u^2 + 2as. Velocity-time graphs and acceleration under gravity.',
  },
];

async function ensurePineconeIndex() {
  const existingIndexes = await pc.listIndexes();
  const indexExists = existingIndexes.indexes?.some((index) => index.name === indexName);

  if (!indexExists) {
    console.log(`Creating Pinecone index: ${indexName} (dimension=${pineconeVectorDimension})`);
    await pc.createIndex({
      name: indexName,
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

async function runIngestion() {
  await ensurePineconeIndex();

  console.log('Connecting to Pinecone index:', indexName);
  const index = pc.Index(indexName);

  for (const chunk of sampleSyllabusChunks) {
    console.log(`Embedding chunk: ${chunk.id} [${chunk.subject} > ${chunk.topic}]`);
    const vector = await embeddings.embedQuery(chunk.text);

    if (vector.length !== pineconeVectorDimension) {
      throw new Error(
        `Embedding dimension mismatch: model produced ${vector.length} dimensions, index expects ${pineconeVectorDimension}`,
      );
    }

    await index.upsert({
      records: [
        {
          id: chunk.id,
          values: vector,
          metadata: {
            subject: chunk.subject,
            topic: chunk.topic,
            subtopic: chunk.subtopic,
            content: chunk.text,
          },
        },
      ],
    });
  }

  console.log('Ingestion complete!');
}

runIngestion().catch((error) => {
  console.error('Ingestion failed:', error);
  process.exitCode = 1;
});