'use server';

import { desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { examAttempts, topicMastery } from '@/db/schema';

// Demo user ID — replace with real auth once auth is wired up
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

export interface SubjectScore {
  subject: string;
  correct: number;
  total: number;
  percentage: number;
}

export interface AttemptRow {
  id: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
  subjectBreakdown: Record<string, SubjectScore> | null;
}

export interface WeakTopic {
  topicId: string;
  topicName: string;
  subject: string;
  accuracyPercentage: number;
  totalAttempts: number;
}

export interface DashboardData {
  latestScore: number | null;
  targetScore: number;
  recentAttempts: AttemptRow[];
  weakTopics: WeakTopic[];
  subjectScores: { name: string; shortName: string; score: number; color: string }[];
}

const SUBJECT_META: Record<
  string,
  { name: string; shortName: string; color: string }
> = {
  USE_OF_ENGLISH: { name: 'Use of English', shortName: 'ENG', color: '#e2763b' },
  MATHEMATICS: { name: 'Mathematics', shortName: 'MTH', color: '#2f7653' },
  PHYSICS: { name: 'Physics', shortName: 'PHY', color: '#5d7e9c' },
  CHEMISTRY: { name: 'Chemistry', shortName: 'CHE', color: '#a07c3c' },
  BIOLOGY: { name: 'Biology', shortName: 'BIO', color: '#6b9e5e' },
  ECONOMICS: { name: 'Economics', shortName: 'ECO', color: '#7a6cb5' },
  GOVERNMENT: { name: 'Government', shortName: 'GOV', color: '#c4813e' },
};

export async function getDashboardDataAction(
  userId: string = DEMO_USER_ID,
): Promise<DashboardData> {
  // 1. Last 5 exam attempts
  const attempts = await db
    .select({
      id: examAttempts.id,
      score: examAttempts.score,
      totalQuestions: examAttempts.totalQuestions,
      completedAt: examAttempts.completedAt,
      subjectBreakdown: examAttempts.subjectBreakdown,
      subjectScoresJson: examAttempts.subjectScoresJson,
    })
    .from(examAttempts)
    .where(eq(examAttempts.userId, userId))
    .orderBy(desc(examAttempts.completedAt))
    .limit(5);

  // 2. Topic mastery (weak topics = under 50% accuracy)
  const masteryRows = await db
    .select({
      topicId: topicMastery.topicId,
      topicName: topicMastery.topicName,
      subject: topicMastery.subject,
      accuracyPercentage: topicMastery.accuracyPercentage,
      totalAttempts: topicMastery.totalAttempts,
    })
    .from(topicMastery)
    .where(eq(topicMastery.userId, userId))
    .orderBy(topicMastery.accuracyPercentage)
    .limit(5);

  const latest = attempts[0];

  // Build per-subject average scores from mastery data
  const subjectAvgMap: Record<string, { total: number; count: number }> = {};
  for (const row of masteryRows) {
    const pct = Number(row.accuracyPercentage ?? 0);
    const sub = row.subject ?? 'UNKNOWN';
    if (!subjectAvgMap[sub]) subjectAvgMap[sub] = { total: 0, count: 0 };
    subjectAvgMap[sub].total += pct;
    subjectAvgMap[sub].count += 1;
  }

  // If we have a latest attempt, prefer its subjectBreakdown for scores
  const breakdownSource = latest?.subjectBreakdown as Record<
    string,
    { correct: number; total: number; percentage: number }
  > | null;

  const subjectScores = Object.entries(SUBJECT_META).map(([key, meta]) => {
    let score = 0;
    if (breakdownSource?.[key]) {
      score = breakdownSource[key].percentage;
    } else if (subjectAvgMap[key]) {
      score = Math.round(subjectAvgMap[key].total / subjectAvgMap[key].count);
    }
    return { name: meta.name, shortName: meta.shortName, score, color: meta.color };
  }).filter((s) => s.score > 0);

  const recentAttempts: AttemptRow[] = attempts.map((a) => ({
    id: a.id,
    score: a.score,
    totalQuestions: a.totalQuestions,
    completedAt: new Date(a.completedAt).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    subjectBreakdown: a.subjectBreakdown as Record<string, SubjectScore> | null,
  }));

  const weakTopics: WeakTopic[] = masteryRows
    .filter((r) => Number(r.accuracyPercentage ?? 0) < 50)
    .map((r) => ({
      topicId: r.topicId,
      topicName: r.topicName ?? 'Unknown topic',
      subject: SUBJECT_META[r.subject ?? '']?.name ?? r.subject ?? 'Unknown',
      accuracyPercentage: Math.round(Number(r.accuracyPercentage ?? 0)),
      totalAttempts: r.totalAttempts,
    }));

  return {
    latestScore: latest?.score ?? null,
    targetScore: 320,
    recentAttempts,
    weakTopics,
    subjectScores,
  };
}

