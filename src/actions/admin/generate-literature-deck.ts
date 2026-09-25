'use server';

import { Pinecone } from '@pinecone-database/pinecone';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { cards, courses, modules, prescribedNovels } from '@/db/schema';

const nvidiaApiKey = process.env.NVIDIA_API_KEY;
const nvidiaBaseUrl = process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1';
const chatModel = process.env.NVIDIA_CHAT_MODEL || 'meta/llama-3.3-70b-instruct';
const embeddingModel = process.env.NVIDIA_EMBEDDING_MODEL || 'nvidia/nemotron-3-embed-1b';
const pineconeApiKey = process.env.PINECONE_API_KEY;
const pineconeIndexName = process.env.PINECONE_INDEX_NAME;

const model = nvidiaApiKey
  ? new ChatOpenAI({
      model: chatModel,
      apiKey: nvidiaApiKey,
      temperature: 0.2,
      configuration: { baseURL: nvidiaBaseUrl },
    })
  : null;

const embeddings = nvidiaApiKey
  ? new OpenAIEmbeddings({
      model: embeddingModel,
      apiKey: nvidiaApiKey,
      configuration: { baseURL: nvidiaBaseUrl },
    })
  : null;

const pinecone = pineconeApiKey ? new Pinecone({ apiKey: pineconeApiKey }) : null;

type GeneratedCard = {
  cardType: 'VISUAL_INTUITION' | 'SOCRATIC_PROBE' | 'TACTILE_CHECK' | 'CONCEPT_WIDGET' | 'MASTERY_CHECK';
  questionText: string;
  options: Array<{ id: string; text: string; isCorrect: boolean }>;
  explanation: string;
};

type GeneratedDeck = {
  author: string;
  summary: string;
  moduleTitle: string;
  cards: GeneratedCard[];
};

export type LiteratureDeckInput = {
  examYear: number;
  bookTitle: string;
  chapterNumber: number;
  chapterText: string;
};

function parseModelJson(content: unknown): GeneratedDeck {
  const raw = Array.isArray(content)
    ? content.map((part) => (typeof part === 'string' ? part : JSON.stringify(part))).join('')
    : String(content);
  const jsonText = raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
  const parsed = JSON.parse(jsonText) as GeneratedDeck;

  if (!parsed.author || !parsed.summary || !parsed.moduleTitle || !Array.isArray(parsed.cards) || parsed.cards.length !== 5) {
    throw new Error('Jamby returned an incomplete five-card deck.');
  }

  for (const card of parsed.cards) {
    if (!card.questionText || !card.explanation || !Array.isArray(card.options) || card.options.length !== 4) {
      throw new Error('Jamby returned a card with an invalid question shape.');
    }
    if (!card.options.some((option) => option.isCorrect)) {
      throw new Error('Jamby returned a card without a correct option.');
    }
  }

  return parsed;
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function generateLiteratureDeckAction(input: LiteratureDeckInput) {
  const bookTitle = input.bookTitle.trim();
  const chapterText = input.chapterText.trim();

  if (!Number.isInteger(input.examYear) || input.examYear < 2020 || input.examYear > 2100) {
    return { success: false as const, error: 'Enter a valid exam year.' };
  }
  if (!bookTitle || bookTitle.length > 255) {
    return { success: false as const, error: 'Enter a book title under 255 characters.' };
  }
  if (!Number.isInteger(input.chapterNumber) || input.chapterNumber < 1) {
    return { success: false as const, error: 'Enter a valid chapter number.' };
  }
  if (chapterText.length < 300 || chapterText.length > 120_000) {
    return { success: false as const, error: 'Chapter text must be between 300 and 120,000 characters.' };
  }
  if (!model || !nvidiaApiKey) {
    return { success: false as const, error: 'NVIDIA configuration is missing.' };
  }

  try {
    const prompt = `Generate a five-card JAMB UTME Literature micro-deck from the chapter excerpt below.

Book title: ${bookTitle}
Chapter number: ${input.chapterNumber}
Exam year: ${input.examYear}

Return JSON only, with this exact shape:
{
  "author": "string",
  "summary": "one concise paragraph",
  "moduleTitle": "chapter or theme title",
  "cards": [
    {
      "cardType": "VISUAL_INTUITION | SOCRATIC_PROBE | TACTILE_CHECK | CONCEPT_WIDGET | MASTERY_CHECK",
      "questionText": "JAMB-style multiple-choice question",
      "options": [
        { "id": "a", "text": "...", "isCorrect": true },
        { "id": "b", "text": "...", "isCorrect": false },
        { "id": "c", "text": "...", "isCorrect": false },
        { "id": "d", "text": "...", "isCorrect": false }
      ],
      "explanation": "brief evidence-based explanation"
    }
  ]
}

Rules:
- Return exactly 5 cards and exactly 4 options per card.
- Use only facts supported by the excerpt; do not invent plot details.
- Vary the cards across character, plot, theme, setting, and literary technique when supported.
- Keep the questions and explanations clear for Nigerian secondary school candidates.

Chapter excerpt:
${chapterText}`;

    const response = await model.invoke([{ role: 'user', content: prompt }]);
    const deck = parseModelJson(response.content);

    const novelRows = await db
      .insert(prescribedNovels)
      .values({
        examYear: input.examYear,
        bookTitle,
        author: deck.author,
        summary: deck.summary,
      })
      .onConflictDoUpdate({
        target: prescribedNovels.examYear,
        set: { bookTitle, author: deck.author, summary: deck.summary },
      })
      .returning({ id: prescribedNovels.id });
    const novelId = novelRows[0].id;

    const courseRows = await db
      .select({ id: courses.id })
      .from(courses)
      .where(and(eq(courses.category, 'JAMB_UTME'), eq(courses.title, 'JAMB Use of English & Literature')))
      .limit(1);
    const courseId = courseRows[0]?.id ?? (await db.insert(courses).values({
      category: 'JAMB_UTME',
      title: 'JAMB Use of English & Literature',
      description: 'Prescribed literature micro-decks for JAMB UTME.',
      iconName: 'book-open',
    }).returning({ id: courses.id }))[0].id;

    const moduleRows = await db.insert(modules).values({
      courseId,
      title: `${deck.moduleTitle} (Chapter ${input.chapterNumber})`,
      nodeOrder: input.chapterNumber,
    }).returning({ id: modules.id });
    const moduleId = moduleRows[0].id;

    await db.insert(cards).values(deck.cards.map((card, index) => ({
      moduleId,
      cardType: card.cardType,
      stepOrder: index + 1,
      questionText: card.questionText,
      contentPayload: {
        subject: 'USE_OF_ENGLISH',
        topic: deck.moduleTitle,
        examYear: input.examYear,
        bookTitle,
        options: card.options,
        explanation: card.explanation,
      },
    })));

    let vectorsSynced = false;
    if (pinecone && embeddings && pineconeIndexName) {
      const index = pinecone.Index(pineconeIndexName);
      const records = [];
      for (const [indexNumber, card] of deck.cards.entries()) {
        const content = `${bookTitle}\nChapter ${input.chapterNumber}\n${deck.moduleTitle}\n${card.questionText}\n${card.explanation}`;
        const vector = await embeddings.embedQuery(content);
        records.push({
          id: `literature-${input.examYear}-${slugify(bookTitle)}-${input.chapterNumber}-${indexNumber + 1}`,
          values: vector,
          metadata: {
            subject: 'USE_OF_ENGLISH',
            topic: deck.moduleTitle,
            examYear: input.examYear,
            bookTitle,
            chapterNumber: input.chapterNumber,
            content,
          },
        });
      }
      await index.upsert({ records });
      vectorsSynced = true;
    }

    return {
      success: true as const,
      moduleId,
      cardCount: deck.cards.length,
      moduleTitle: deck.moduleTitle,
      vectorsSynced,
      novelId,
    };
  } catch (error) {
    console.error('Literature deck generation failed:', error);
    return { success: false as const, error: 'Jamby could not generate this deck. Check the excerpt and try again.' };
  }
}
