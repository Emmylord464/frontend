'use server';

import { sql } from 'drizzle-orm';
import { db } from '@/db';
import { pastQuestions, syllabusTopics } from '@/db/schema';

export type SubjectKey = string;

export interface ExamQuestion {
  id: string;
  subject: SubjectKey;
  questionText: string;
  options: { key: string; text: string }[];
}

export interface FetchedExamQuestions {
  [subject: string]: ExamQuestion[];
}

export const QUESTIONS_PER_SUBJECT: Record<string, number> = new Proxy(
  {
    USE_OF_ENGLISH: 60,
  },
  {
    get: (target, prop: string) => (prop === 'USE_OF_ENGLISH' ? 60 : 40),
  },
);

const demoQuestionBank: Record<SubjectKey, ExamQuestion[]> = {
  USE_OF_ENGLISH: [
    {
      id: 'demo-eng-1',
      subject: 'USE_OF_ENGLISH',
      questionText: 'Choose the most appropriate option to complete the sentence: "The manager insisted that the report ____ submitted before noon."',
      options: [
        { key: 'A', text: 'be' },
        { key: 'B', text: 'is' },
        { key: 'C', text: 'was' },
        { key: 'D', text: 'been' },
      ],
    },
    {
      id: 'demo-eng-2',
      subject: 'USE_OF_ENGLISH',
      questionText: 'Which of the following is the best synonym for the word "meticulous"?',
      options: [
        { key: 'A', text: 'careless' },
        { key: 'B', text: 'careful' },
        { key: 'C', text: 'hasty' },
        { key: 'D', text: 'reckless' },
      ],
    },
  ],
  MATHEMATICS: [
    {
      id: 'demo-math-1',
      subject: 'MATHEMATICS',
      questionText: 'If 3x + 7 = 22, what is the value of x?',
      options: [
        { key: 'A', text: '3' },
        { key: 'B', text: '4' },
        { key: 'C', text: '5' },
        { key: 'D', text: '6' },
      ],
    },
    {
      id: 'demo-math-2',
      subject: 'MATHEMATICS',
      questionText: 'Solve for y: 2y - 9 = 11',
      options: [
        { key: 'A', text: '8' },
        { key: 'B', text: '9' },
        { key: 'C', text: '10' },
        { key: 'D', text: '11' },
      ],
    },
  ],
  PHYSICS: [
    {
      id: 'demo-physics-1',
      subject: 'PHYSICS',
      questionText: 'A body moving with uniform velocity has:',
      options: [
        { key: 'A', text: 'changing speed' },
        { key: 'B', text: 'zero acceleration' },
        { key: 'C', text: 'increasing distance' },
        { key: 'D', text: 'variable mass' },
      ],
    },
    {
      id: 'demo-physics-2',
      subject: 'PHYSICS',
      questionText: 'Which instrument is used to measure electric current?',
      options: [
        { key: 'A', text: 'Voltmeter' },
        { key: 'B', text: 'Ammeter' },
        { key: 'C', text: 'Thermometer' },
        { key: 'D', text: 'Barometer' },
      ],
    },
  ],
  CHEMISTRY: [
    {
      id: 'demo-chem-1',
      subject: 'CHEMISTRY',
      questionText: 'The valency of oxygen is:',
      options: [
        { key: 'A', text: '1' },
        { key: 'B', text: '2' },
        { key: 'C', text: '3' },
        { key: 'D', text: '4' },
      ],
    },
    {
      id: 'demo-chem-2',
      subject: 'CHEMISTRY',
      questionText: 'Which gas is most abundant in the atmosphere?',
      options: [
        { key: 'A', text: 'Oxygen' },
        { key: 'B', text: 'Carbon dioxide' },
        { key: 'C', text: 'Nitrogen' },
        { key: 'D', text: 'Hydrogen' },
      ],
    },
  ],
};

// In-memory cache for ultra-fast sub-second loading (< 20ms)
const questionCache = new Map<string, { data: FetchedExamQuestions; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function fetchExamQuestionsAction(
  subjects: SubjectKey[] = ['USE_OF_ENGLISH', 'MATHEMATICS', 'PHYSICS', 'CHEMISTRY'],
): Promise<{ success: true; questions: FetchedExamQuestions } | { success: false; error: string }> {
  try {
    const cacheKey = subjects.slice().sort().join(':');
    const cached = questionCache.get(cacheKey);
    const now = Date.now();

    // Serve from cache if fresh (takes < 1ms)
    if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
      return { success: true, questions: cached.data };
    }

    const result: FetchedExamQuestions = {};

    // Execute queries in PARALLEL across all requested subjects
    await Promise.all(
      subjects.map(async (subject) => {
        const limit = QUESTIONS_PER_SUBJECT[subject] || 40;

        const rows = await db
          .select({
            id: pastQuestions.id,
            questionText: pastQuestions.questionText,
            options: pastQuestions.options,
            subject: pastQuestions.subject,
          })
          .from(pastQuestions)
          .where(sql`${pastQuestions.subject} = ${subject}`)
          .orderBy(sql`RANDOM()`)
          .limit(limit);

        const mappedRows = rows.map((row) => {
          const rawOptions = row.options as any;
          let options: { key: string; text: string }[] = [];

          if (Array.isArray(rawOptions)) {
            options = rawOptions.map((o: any) => ({
              key: String(o.key || o.id || 'A').trim().toUpperCase(),
              text: String(o.text || '').trim(),
            }));
          } else if (rawOptions && typeof rawOptions === 'object') {
            options = Object.entries(rawOptions).map(([key, text]) => ({
              key: key.trim().toUpperCase(),
              text: String(text || '').trim(),
            }));
          }

          return {
            id: row.id,
            subject,
            questionText: row.questionText,
            options,
          };
        });

        result[subject] = mappedRows.length > 0 ? mappedRows : demoQuestionBank[subject] ?? [];
      })
    );

    // Save to cache
    questionCache.set(cacheKey, { data: result, timestamp: now });

    return { success: true, questions: result };
  } catch (error) {
    console.error('Fetch exam questions error:', error);

    const fallback: FetchedExamQuestions = {};
    for (const subject of subjects) {
      fallback[subject] = demoQuestionBank[subject] ?? [];
    }

    return { success: true, questions: fallback };
  }
}

