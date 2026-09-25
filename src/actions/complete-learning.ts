'use server';

import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { userProgress } from '@/db/schema';

const demoUserId = '00000000-0000-0000-0000-000000000001';

type ProgressResult = {
  success: true;
  currentStreakDays: number;
};

function dayNumber(date: Date) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export async function completeLearningSession(moduleId: string): Promise<ProgressResult | { success: false; error: string }> {
  if (!moduleId.trim()) {
    return { success: false, error: 'A module is required.' };
  }

  try {
    const now = new Date();
    const [existingProgress] = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, demoUserId))
      .limit(1);

    if (!existingProgress) {
      await db.insert(userProgress).values({
        userId: demoUserId,
        completedModuleIds: [moduleId],
        currentStreakDays: 1,
        lastActiveDate: now,
      });
      return { success: true, currentStreakDays: 1 };
    }

    const previousDate = existingProgress.lastActiveDate;
    const elapsedDays = previousDate
      ? Math.round((dayNumber(now) - dayNumber(previousDate)) / 86_400_000)
      : 0;
    const currentStreakDays = elapsedDays === 1
      ? existingProgress.currentStreakDays + 1
      : elapsedDays === 0
        ? existingProgress.currentStreakDays
        : 1;
    const completedModuleIds = Array.isArray(existingProgress.completedModuleIds)
      ? existingProgress.completedModuleIds.filter((value): value is string => typeof value === 'string')
      : [];

    await db
      .update(userProgress)
      .set({
        completedModuleIds: completedModuleIds.includes(moduleId)
          ? completedModuleIds
          : [...completedModuleIds, moduleId],
        currentStreakDays,
        lastActiveDate: now,
      })
      .where(and(eq(userProgress.id, existingProgress.id), eq(userProgress.userId, demoUserId)));

    return { success: true, currentStreakDays };
  } catch (error) {
    console.error('Learning progress update failed:', error);
    return { success: false, error: 'Failed to save learning progress.' };
  }
}
