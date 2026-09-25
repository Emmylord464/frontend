'use server';

import { db } from '@/db';
import { userAnalytics, users } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { DEMO_USER_ID, type AnalyticsSummary } from '@/lib/lean-types';

export async function saveSessionAnalyticsAction(data: {
  subject: string;
  correctCards: number;
  totalCards: number;
  averageSeconds: number;
  masteredTopics: string[];
  weakTopics: string[];
}): Promise<{ success: boolean; scoreProbability: number; error?: string }> {
  try {
    const accuracyRate = data.totalCards > 0 ? (data.correctCards / data.totalCards) * 100 : 0;
    const masteryScore = Math.round(accuracyRate);

    // Calculate score probability
    let probability = Math.round(accuracyRate * 0.8 + (data.averageSeconds < 30 ? 15 : 5));
    probability = Math.max(10, Math.min(99, probability));

    await db.insert(userAnalytics).values({
      userId: DEMO_USER_ID,
      subject: data.subject.toUpperCase(),
      masteryScore,
      topicMasteryScore: masteryScore,
      scoreProbability: probability,
      strengths: data.masteredTopics,
      weaknesses: data.weakTopics,
    });

    return { success: true, scoreProbability: probability };
  } catch (err: any) {
    console.error('Failed to save analytics session:', err);
    return { success: false, scoreProbability: 50, error: err?.message };
  }
}

export async function getSubjectAnalyticsAction(subjectKey: string): Promise<AnalyticsSummary> {
  try {
    const normalizedSubject = subjectKey.toUpperCase();

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, DEMO_USER_ID))
      .limit(1);

    const [latestRecord] = await db
      .select()
      .from(userAnalytics)
      .where(and(eq(userAnalytics.userId, DEMO_USER_ID), eq(userAnalytics.subject, normalizedSubject)))
      .orderBy(desc(userAnalytics.updatedAt))
      .limit(1);

    if (latestRecord) {
      return {
        subject: latestRecord.subject,
        masteryScore: latestRecord.masteryScore ?? 0,
        scoreProbability: latestRecord.scoreProbability,
        strengths: (latestRecord.strengths as string[]) || [],
        weaknesses: (latestRecord.weaknesses as string[]) || [],
        totalAttempts: 15,
        accuracyRate: latestRecord.masteryScore ?? 0,
        averageSpeedSeconds: 22,
        targetScore: user?.targetScore || 250,
        streakCount: user?.streakCount || 1,
      };
    }

    return {
      subject: normalizedSubject,
      masteryScore: 68,
      scoreProbability: 72,
      strengths: ['Core Fundamentals', 'Vocabulary Recall'],
      weaknesses: ['Speed Timing', 'Advanced Problem Solving'],
      totalAttempts: 10,
      accuracyRate: 68,
      averageSpeedSeconds: 26,
      targetScore: user?.targetScore || 250,
      streakCount: user?.streakCount || 1,
    };
  } catch (err) {
    console.error('Failed to fetch analytics:', err);
    return {
      subject: subjectKey,
      masteryScore: 60,
      scoreProbability: 65,
      strengths: ['Standard Comprehension'],
      weaknesses: ['Pacing & Speed'],
      totalAttempts: 5,
      accuracyRate: 60,
      averageSpeedSeconds: 28,
      targetScore: 250,
      streakCount: 1,
    };
  }
}
