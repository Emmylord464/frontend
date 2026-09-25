'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { DEMO_USER_ID, type UserProfile } from '@/lib/lean-types';

export async function getUserProfileAction(): Promise<UserProfile> {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, DEMO_USER_ID))
      .limit(1);

    if (user) {
      return {
        id: user.id,
        email: user.email,
        name: user.name || user.fullName || 'JAMB Scholar',
        targetCourse: user.targetCourse || 'Medicine & Surgery',
        targetScore: user.targetScore || 280,
        streakCount: user.streakCount || 1,
      };
    }

    // Default fallback
    return {
      id: DEMO_USER_ID,
      email: 'scholar@jambai.ng',
      name: 'JAMB Scholar',
      targetCourse: 'Medicine & Surgery',
      targetScore: 280,
      streakCount: 1,
    };
  } catch (err) {
    console.error('Failed to fetch user profile:', err);
    return {
      id: DEMO_USER_ID,
      email: 'scholar@jambai.ng',
      name: 'JAMB Scholar',
      targetCourse: 'Medicine & Surgery',
      targetScore: 280,
      streakCount: 1,
    };
  }
}

export async function updateUserTargetAction(
  targetCourse: string,
  targetScore: number
): Promise<{ success: boolean; error?: string }> {
  try {
    await db
      .insert(users)
      .values({
        id: DEMO_USER_ID,
        email: 'scholar@jambai.ng',
        name: 'JAMB Scholar',
        targetCourse,
        targetScore,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          targetCourse,
          targetScore,
        },
      });

    return { success: true };
  } catch (err: any) {
    console.error('Failed to update target:', err);
    return { success: false, error: err?.message || 'Database update failed' };
  }
}
