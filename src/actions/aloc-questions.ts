'use server';

/**
 * aloc-questions.ts
 *
 * Runtime server action that fetches questions from:
 *   1. Neon/Postgres DB (past_questions table — fast, cached)
 *   2. ALOC Station API  (live fallback when DB count is low for a subject)
 *
 * Exported Question shape matches src/types/index.ts → Question interface
 * so DrillView and MockExam can consume it directly.
 */

import { db } from '@/db';
import { pastQuestions, userAttempts } from '@/db/schema';
import { eq, sql, and, inArray } from 'drizzle-orm';
import { DEMO_USER_ID } from '@/lib/lean-types';
import type { Question, QuestionOption } from '@/types';

// ─── ALOC API config ────────────────────────────────────────────────────────
const ALOC_BASE_URL = 'https://questions.aloc.com.ng/api/v2/m';
const ALOC_TOKEN = process.env.ALOC_TOKEN || process.env.ALOC_ACCESS_TOKEN || process.env.NEXT_PUBLIC_ALOC_TOKEN;

// Maps frontend subject IDs → ALOC subject slug + DB enum key
const SUBJECT_MAP: Record<string, { alocSlug: string; dbKey: string; displayName: string }> = {
  english: { alocSlug: 'english', dbKey: 'USE_OF_ENGLISH', displayName: 'Use of English' },
  mathematics: { alocSlug: 'mathematics', dbKey: 'MATHEMATICS', displayName: 'Mathematics' },
  maths: { alocSlug: 'mathematics', dbKey: 'MATHEMATICS', displayName: 'Mathematics' },
  physics: { alocSlug: 'physics', dbKey: 'PHYSICS', displayName: 'Physics' },
  chemistry: { alocSlug: 'chemistry', dbKey: 'CHEMISTRY', displayName: 'Chemistry' },
  biology: { alocSlug: 'biology', dbKey: 'BIOLOGY', displayName: 'Biology' },
  economics: { alocSlug: 'economics', dbKey: 'ECONOMICS', displayName: 'Economics' },
  government: { alocSlug: 'government', dbKey: 'GOVERNMENT', displayName: 'Government' },
  literature: { alocSlug: 'literature', dbKey: 'LITERATURE', displayName: 'Literature-in-English' },
  commerce: { alocSlug: 'commerce', dbKey: 'COMMERCE', displayName: 'Commerce' },
  accounting: { alocSlug: 'accounting', dbKey: 'ACCOUNTING', displayName: 'Financial Accounting' },
  crs: { alocSlug: 'crs', dbKey: 'CRS', displayName: 'Christian Religious Studies' },
  irs: { alocSlug: 'irs', dbKey: 'IRS', displayName: 'Islamic Religious Studies' },
  geography: { alocSlug: 'geography', dbKey: 'GEOGRAPHY', displayName: 'Geography' },
  agric: { alocSlug: 'agric', dbKey: 'AGRIC', displayName: 'Agricultural Science' },
  history: { alocSlug: 'history', dbKey: 'HISTORY', displayName: 'History' },
  civic: { alocSlug: 'civic', dbKey: 'CIVIC', displayName: 'Civic Education' },
  hausa: { alocSlug: 'hausa', dbKey: 'HAUSA', displayName: 'Hausa' },
  igbo: { alocSlug: 'igbo', dbKey: 'IGBO', displayName: 'Igbo' },
  yoruba: { alocSlug: 'yoruba', dbKey: 'YORUBA', displayName: 'Yoruba' },
  french: { alocSlug: 'french', dbKey: 'FRENCH', displayName: 'French' },
};

// ─── HTML strip (no DOMParser in Node) ──────────────────────────────────────
function stripHtml(raw: string): string {
  return (raw ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\s{2,}/g, ' ').trim();
}

// ─── Answer key normaliser ───────────────────────────────────────────────────
function normaliseAnswer(raw: string): 'A' | 'B' | 'C' | 'D' {
  if (!raw) return 'A';
  const s = raw.trim().toLowerCase();
  if (/^[1-4]$/.test(s)) return (['A', 'B', 'C', 'D'] as const)[parseInt(s) - 1];
  const m = s.match(/[a-d]/);
  if (m) return m[0].toUpperCase() as 'A' | 'B' | 'C' | 'D';
  return 'A';
}

// ─── Map a DB row → Question ─────────────────────────────────────────────────
function dbRowToQuestion(r: {
  id: string;
  subject: string | null;
  questionText: string;
  options: unknown;
  correctOption: string | null;
  explanation: string | null;
  year: string | null;
}, subjectId: string): Question {
  let opts: { id: string; text: string }[] = [];
  try {
    const raw = typeof r.options === 'string' ? JSON.parse(r.options) : (r.options as any[]);
    opts = (raw as any[])
      .filter((o: any) => o && (o.id || o.key))
      .map((o: any) => ({
        id: (o.id || o.key || 'A').toUpperCase(),
        text: o.text || '',
      }));
  } catch {
    opts = [];
  }

  // Ensure A-D exist
  const optMap: Record<string, string> = {};
  for (const o of opts) optMap[o.id] = o.text;
  const finalOpts: QuestionOption[] = (['A', 'B', 'C', 'D'] as const).map((k) => ({
    id: k,
    text: optMap[k] || `Option ${k}`,
  }));

  const subjectConfig = Object.values(SUBJECT_MAP).find(
    (s) => s.dbKey === (r.subject ?? '').toUpperCase()
  );

  return {
    id: r.id,
    subjectId,
    subjectName: subjectConfig?.displayName ?? subjectId,
    year: r.year ?? undefined,
    text: r.questionText,
    options: finalOpts,
    correctAnswer: normaliseAnswer(r.correctOption ?? 'A'),
    explanation: r.explanation || 'Official JAMB past question answer.',
    syllabusTopic: 'Past Questions',
    difficulty: 'Medium',
  };
}

// ─── Map ALOC API response → Question ────────────────────────────────────────
interface ALOCQuestion {
  id: number;
  question: string;
  option: { a: string; b: string; c: string; d: string };
  answer: string;
  solution?: string;
  examyear?: string | number;
}

function alocToQuestion(q: ALOCQuestion, subjectId: string): Question | null {
  const text = stripHtml(q.question ?? '');
  if (text.length < 15) return null;
  if (/<(table|img|tr|td|svg)/i.test(q.question ?? '')) return null;

  const optMap: Partial<Record<'a' | 'b' | 'c' | 'd', string>> = {};
  for (const k of ['a', 'b', 'c', 'd'] as const) {
    const v = stripHtml(q.option?.[k] ?? '');
    if (v) optMap[k] = v;
  }
  if (!optMap.a || !optMap.b || !optMap.c || !optMap.d) return null;

  const correctAnswer = normaliseAnswer(q.answer ?? 'A');
  const subjectConfig = SUBJECT_MAP[subjectId];

  return {
    id: `aloc-${q.id}`,
    subjectId,
    subjectName: subjectConfig?.displayName ?? subjectId,
    year: q.examyear ? String(q.examyear) : undefined,
    text,
    options: [
      { id: 'A', text: optMap.a },
      { id: 'B', text: optMap.b },
      { id: 'C', text: optMap.c },
      { id: 'D', text: optMap.d },
    ],
    correctAnswer,
    explanation: q.solution ? stripHtml(q.solution) : 'Official JAMB past question answer.',
    syllabusTopic: 'Past Questions',
    difficulty: 'Medium',
  };
}

// ─── Fetch from ALOC API ──────────────────────────────────────────────────────
async function fetchFromALOC(alocSlug: string, subjectId: string, limit: number): Promise<Question[]> {
  try {
    const url = `${ALOC_BASE_URL}?subject=${encodeURIComponent(alocSlug)}&type=utme`;
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (ALOC_TOKEN) headers['AccessToken'] = ALOC_TOKEN;

    const res = await fetch(url, { headers, next: { revalidate: 60 } });
    if (!res.ok) return [];

    const json = await res.json() as { data?: ALOCQuestion | ALOCQuestion[] };
    const data = Array.isArray(json.data) ? json.data : json.data ? [json.data] : [];

    const questions: Question[] = [];
    for (const q of data) {
      const mapped = alocToQuestion(q, subjectId);
      if (mapped) questions.push(mapped);
      if (questions.length >= limit) break;
    }
    return questions;
  } catch {
    return [];
  }
}

// ────────────────────────────────────────────────────────────────────────────
// PUBLIC SERVER ACTIONS
// ────────────────────────────────────────────────────────────────────────────

/**
 * Fetch drill questions for a subject.
 * Strategy: DB first (shuffled), ALOC fill if DB < limit.
 */
export async function fetchSubjectQuestionsAction(
  subjectId: string,
  limit: number = 20,
): Promise<{ success: boolean; questions: Question[]; source: 'db' | 'aloc' | 'mixed' | 'empty' }> {
  try {
    const config = SUBJECT_MAP[subjectId.toLowerCase()];
    if (!config) return { success: true, questions: [], source: 'empty' };

    // 1. Try DB
    const rows = await db
      .select({
        id: pastQuestions.id,
        subject: pastQuestions.subject,
        questionText: pastQuestions.questionText,
        options: pastQuestions.options,
        correctOption: pastQuestions.correctOption,
        explanation: pastQuestions.explanation,
        year: pastQuestions.year,
      })
      .from(pastQuestions)
      .where(eq(pastQuestions.subject as any, config.dbKey as any))
      .orderBy(sql`RANDOM()`)
      .limit(limit);

    const dbQuestions = rows.map((r) => dbRowToQuestion(r, subjectId));

    if (dbQuestions.length >= limit) {
      return { success: true, questions: dbQuestions, source: 'db' };
    }

    // 2. Fill from ALOC
    const needed = limit - dbQuestions.length;
    const alocQuestions = await fetchFromALOC(config.alocSlug, subjectId, needed);

    const combined = [...dbQuestions, ...alocQuestions];
    const source = combined.length === 0 ? 'empty'
      : dbQuestions.length === 0 ? 'aloc'
      : alocQuestions.length === 0 ? 'db'
      : 'mixed';

    return { success: true, questions: combined, source };
  } catch (err: any) {
    console.error('[fetchSubjectQuestionsAction]', err);
    return { success: false, questions: [], source: 'empty' };
  }
}

/**
 * Fetch a full JAMB mock exam set — 4 subjects, N questions each.
 * Default: english 60, others 20 each = 120 total (real UTME split).
 */
export async function fetchMockExamQuestionsAction(opts?: {
  englishCount?: number;
  otherCount?: number;
}): Promise<{ success: boolean; questions: Question[]; totalCount: number }> {
  const englishCount = opts?.englishCount ?? 60;
  const otherCount = opts?.otherCount ?? 20;

  const subjects: { id: string; limit: number }[] = [
    { id: 'english', limit: englishCount },
    { id: 'mathematics', limit: otherCount },
    { id: 'physics', limit: otherCount },
    { id: 'chemistry', limit: otherCount },
  ];

  const all: Question[] = [];

  await Promise.allSettled(
    subjects.map(async ({ id, limit }) => {
      const { questions } = await fetchSubjectQuestionsAction(id, limit);
      all.push(...questions);
    })
  );

  return { success: true, questions: all, totalCount: all.length };
}

/**
 * Record a mock exam session result.
 */
export async function recordMockExamAttemptAction(data: {
  questionId: string;
  selectedOption: string;
  isCorrect: boolean;
  timeSpentSeconds: number;
}) {
  try {
    if (!data.questionId.startsWith('aloc-') && !data.questionId.startsWith('mock-')) {
      await db.insert(userAttempts).values({
        userId: DEMO_USER_ID,
        questionId: data.questionId,
        selectedOption: data.selectedOption,
        isCorrect: data.isCorrect,
        timeSpentSeconds: Math.max(1, data.timeSpentSeconds),
      });
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}
