'use server';

import { and, eq, inArray } from 'drizzle-orm';
import { db } from '@/db';
import { examAttempts, pastQuestions, syllabusTopics, topicMastery } from '@/db/schema';

export interface SubmitExamPayload {
  userId: string;
  answers: Record<string, string>;
}

type SubjectBreakdown = Record<
  string,
  { correct: number; total: number; percentage: number }
>;

export async function submitExam(payload: SubmitExamPayload) {
  const questionIds = Object.keys(payload.answers);

  if (!payload.userId || questionIds.length === 0) {
    return { success: false as const, error: 'A user and at least one answer are required.' };
  }

  try {
    return await db.transaction(async (transaction) => {
      const questions = await transaction
        .select({
          id: pastQuestions.id,
          topicId: pastQuestions.topicId,
          subject: syllabusTopics.subject,
          topic: syllabusTopics.topicName,
          correctOption: pastQuestions.correctOption,
        })
        .from(pastQuestions)
        .innerJoin(syllabusTopics, eq(pastQuestions.topicId, syllabusTopics.id))
        .where(inArray(pastQuestions.id, questionIds));

      const normalizedQuestions = questions.filter(
        (question) =>
          !!question.id &&
          !!question.topicId &&
          !!question.subject &&
          !!question.topic &&
          !!question.correctOption,
      ) as Array<{
        id: string;
        topicId: string;
        subject: string;
        topic: string;
        correctOption: string;
      }>;

      if (normalizedQuestions.length !== questionIds.length) {
        return {
          success: false as const,
          error: 'Some submitted questions could not be found.',
        };
      }

      const subjectBreakdown: SubjectBreakdown = {};
      const topicResults = new Map<
        string,
        { topicId: string; correct: number; total: number }
      >();
      let score = 0;

      for (const question of normalizedQuestions) {
        const isCorrect = payload.answers[question.id] === question.correctOption;
        const subjectResult = subjectBreakdown[question.subject] ?? {
          correct: 0,
          total: 0,
          percentage: 0,
        };

        subjectResult.total += 1;
        if (isCorrect) {
          subjectResult.correct += 1;
          score += 1;
        }
        subjectResult.percentage = Math.round(
          (subjectResult.correct / subjectResult.total) * 100,
        );
        subjectBreakdown[question.subject] = subjectResult;

        const topicResult = topicResults.get(question.topicId) ?? {
          topicId: String(question.topicId),
          correct: 0,
          total: 0,
        };
        topicResult.total += 1;
        if (isCorrect) topicResult.correct += 1;
        topicResults.set(question.topicId, topicResult);
      }

      const [attempt] = await transaction
        .insert(examAttempts)
        .values({
          userId: payload.userId,
          score,
          totalQuestions: questions.length,
          subjectBreakdown,
        })
        .returning({ id: examAttempts.id });

      for (const result of topicResults.values()) {
        const [existingMastery] = await transaction
          .select({
            id: topicMastery.id,
            accuracyRate: topicMastery.accuracyRate,
            totalAttempts: topicMastery.totalAttempts,
          })
          .from(topicMastery)
          .where(
            and(
              eq(topicMastery.userId, payload.userId),
              eq(topicMastery.topicId, String(result.topicId)),
            ),
          )
          .limit(1);

        if (existingMastery) {
          const masteryId = String(existingMastery.id ?? '');
          const previousAttempts = Number(existingMastery.totalAttempts ?? 0);
          const previousCorrect = previousAttempts * Number(existingMastery.accuracyRate ?? 0);
          const totalAttempts = previousAttempts + result.total;
          const accuracyRate =
            (previousCorrect + result.correct) / totalAttempts;

          await transaction
            .update(topicMastery)
            .set({ totalAttempts, accuracyRate })
            .where(eq(topicMastery.id, masteryId));
        } else {
          await transaction.insert(topicMastery).values({
            userId: payload.userId,
            topicId: String(result.topicId),
            totalAttempts: result.total,
            accuracyRate: result.correct / result.total,
          });
        }
      }

      return {
        success: true as const,
        attemptId: attempt.id,
        score,
        totalQuestions: questions.length,
        subjectBreakdown,
      };
    });
  } catch (error) {
    console.error('Exam submission failed:', error);
    return { success: false as const, error: 'Failed to save exam submission.' };
  }
}

export const submitCbtExamAction = submitExam;
