'use server';

import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { examAttempts, topicMastery } from '@/db/schema';

export interface SubjectResult {
  name: string;
  score: number;
  max: number;
  status: 'STRONG' | 'AVERAGE' | 'NEEDS_PRACTICE';
  color: string;
}

export interface WeakTopicResult {
  title: string;
  subject: string;
  accuracy: number;
}

export interface ExamAttemptDiagnostic {
  attemptId: string;
  totalScore: number;
  targetScore: number;
  totalQuestions: number;
  timeSpentMins: number;
  subjects: SubjectResult[];
  weakTopics: WeakTopicResult[];
}

const SUBJECT_CONFIG: Record<string, { name: string; color: string }> = {
  USE_OF_ENGLISH: { name: 'Use of English', color: '#e2763b' },
  MATHEMATICS: { name: 'Mathematics', color: '#2f7653' },
  PHYSICS: { name: 'Physics', color: '#5d7e9c' },
  CHEMISTRY: { name: 'Chemistry', color: '#a07c3c' },
  BIOLOGY: { name: 'Biology', color: '#6b9e5e' },
  ECONOMICS: { name: 'Economics', color: '#7a6cb5' },
  GOVERNMENT: { name: 'Government', color: '#c4813e' },
};

function isUUID(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export async function getExamAttemptAction(
  attemptId: string,
): Promise<{ success: true; diagnostic: ExamAttemptDiagnostic } | { success: false; error: string }> {
  try {
    if (!attemptId || !isUUID(attemptId)) {
      return { success: false, error: 'Invalid attempt ID.' };
    }

    const rows = await db
      .select()
      .from(examAttempts)
      .where(eq(examAttempts.id, attemptId))
      .limit(1);

    if (rows.length === 0) {
      return { success: false, error: 'Attempt not found.' };
    }

    const attempt = rows[0];
    const breakdown = (attempt.subjectBreakdown ?? {}) as Record<
      string,
      { correct: number; total: number; percentage: number }
    >;

    const subjects: SubjectResult[] = Object.entries(breakdown).map(([key, data]) => {
      const cfg = SUBJECT_CONFIG[key] ?? {
        name: key.replace(/_/g, ' '),
        color: '#2f7653',
      };
      const pct = data.percentage ?? Math.round((data.correct / Math.max(data.total, 1)) * 100);
      const status: SubjectResult['status'] =
        pct >= 70 ? 'STRONG' : pct >= 50 ? 'AVERAGE' : 'NEEDS_PRACTICE';

      return {
        name: cfg.name,
        score: data.correct,
        max: data.total,
        status,
        color: cfg.color,
      };
    });

    // Fetch weak topics for this user (< 50% accuracy)
    const weakMastery = await db
      .select({
        topicName: topicMastery.topicName,
        subject: topicMastery.subject,
        accuracyPercentage: topicMastery.accuracyPercentage,
      })
      .from(topicMastery)
      .where(eq(topicMastery.userId, attempt.userId))
      .limit(5);

    const weakTopics: WeakTopicResult[] = weakMastery
      .filter((m) => Number(m.accuracyPercentage) < 50)
      .map((m) => ({
        title: m.topicName,
        subject: m.subject,
        accuracy: Math.round(Number(m.accuracyPercentage)),
      }));

    return {
      success: true,
      diagnostic: {
        attemptId: attempt.id,
        totalScore: attempt.score,
        targetScore: 320,
        totalQuestions: attempt.totalQuestions,
        timeSpentMins: Math.round((attempt.timeSpentSeconds || 0) / 60) || 45,
        subjects,
        weakTopics,
      },
    };
  } catch (error) {
    console.error('getExamAttemptAction error:', error);
    return { success: false, error: 'Failed to fetch exam attempt diagnostic.' };
  }
}

