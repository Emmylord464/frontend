'use server';

import { randomBytes } from 'node:crypto';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { battleParticipants, battleRooms, pastQuestions, syllabusTopics } from '@/db/schema';

const battleSubjects = [
  'USE_OF_ENGLISH',
  'MATHEMATICS',
  'PHYSICS',
  'CHEMISTRY',
] as const;

type BattleSubject = (typeof battleSubjects)[number];

function createRoomCode() {
  return `JAMB-${randomBytes(3).toString('hex').toUpperCase()}`;
}

export async function createBattleRoomAction(
  hostUserId: string,
  subject: BattleSubject,
) {
  if (!hostUserId || !battleSubjects.includes(subject)) {
    return { success: false as const, error: 'A valid host and subject are required.' };
  }

  try {
    const questions = await db
      .select({ id: pastQuestions.id })
      .from(pastQuestions)
      .innerJoin(syllabusTopics, eq(pastQuestions.topicId, syllabusTopics.id))
      .where(eq(syllabusTopics.subject, subject))
      .orderBy(sql`RANDOM()`)
      .limit(10);

    if (questions.length < 10) {
      return {
        success: false as const,
        error: 'Not enough questions are available for this subject yet.',
      };
    }

    const questionIds = questions.map((question) => question.id);
    const roomCode = createRoomCode();

    const result = await db.transaction(async (transaction) => {
      const [room] = await transaction
        .insert(battleRooms)
        .values({
          roomCode,
          hostUserId,
          subject,
          questionIds,
          status: 'WAITING',
        })
        .returning({ id: battleRooms.id, roomCode: battleRooms.roomCode });

      await transaction.insert(battleParticipants).values({
        roomId: room.id,
        userId: hostUserId,
      });

      return room;
    });

    return {
      success: true as const,
      roomCode: result.roomCode,
      shareableUrl: `/battle/${result.roomCode}`,
    };
  } catch (error) {
    console.error('Create Battle Error:', error);
    return { success: false as const, error: 'Failed to create battle room.' };
  }
}