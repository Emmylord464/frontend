'use server';

import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { db } from '@/db';
import { cards, courses, modules } from '@/db/schema';

export interface WorkoutCard {
  id: string;
  stepOrder: number;
  subject: string;
  topic: string;
  cardType: string;
  questionText: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation: string;
  isHighYield: boolean;
}

type CardPayload = {
  options?: unknown;
  explanation?: unknown;
};

function isOptions(value: unknown): value is WorkoutCard['options'] {
  return Array.isArray(value) && value.every((option) => (
    typeof option === 'object'
      && option !== null
      && typeof (option as { id?: unknown }).id === 'string'
      && typeof (option as { text?: unknown }).text === 'string'
      && typeof (option as { isCorrect?: unknown }).isCorrect === 'boolean'
  ));
}

export async function getDailyWorkoutAction(userId: string, activeSubject: string) {
  if (!userId.trim() || !activeSubject.trim()) {
    return { success: false as const, error: 'A user and active subject are required.' };
  }

  try {
    const highYieldModules = await db
      .select({
        id: modules.id,
        title: modules.title,
        historicalWeight: modules.historicalWeight,
        isHighYield: modules.isHighYield,
      })
      .from(modules)
      .innerJoin(courses, eq(modules.courseId, courses.id))
      .where(and(eq(courses.subject, activeSubject), eq(modules.isHighYield, true)))
      .orderBy(desc(modules.historicalWeight))
      .limit(5);

    let targetModules = highYieldModules;
    if (targetModules.length === 0) {
      targetModules = await db
        .select({
          id: modules.id,
          title: modules.title,
          historicalWeight: modules.historicalWeight,
          isHighYield: modules.isHighYield,
        })
        .from(modules)
        .innerJoin(courses, eq(modules.courseId, courses.id))
        .where(eq(courses.subject, activeSubject))
        .orderBy(desc(modules.nodeOrder))
        .limit(3);
    }

    if (targetModules.length === 0) {
      return { success: false as const, error: 'No modules found for this subject. Please seed course decks first.' };
    }

    const selectedCards = await db
      .select({
        id: cards.id,
        stepOrder: cards.stepOrder,
        cardType: cards.cardType,
        questionText: cards.questionText,
        contentPayload: cards.contentPayload,
        moduleTitle: modules.title,
        isHighYield: modules.isHighYield,
      })
      .from(cards)
      .innerJoin(modules, eq(cards.moduleId, modules.id))
      .where(inArray(cards.moduleId, targetModules.map((module) => module.id)))
      .orderBy(sql`RANDOM()`)
      .limit(5);

    const formattedCards: WorkoutCard[] = selectedCards.map((card) => {
      const payload = card.contentPayload as CardPayload;
      return {
        id: card.id,
        stepOrder: card.stepOrder,
        subject: activeSubject,
        topic: card.moduleTitle,
        cardType: card.cardType,
        questionText: card.questionText,
        options: isOptions(payload.options) ? payload.options : [],
        explanation: typeof payload.explanation === 'string' ? payload.explanation : '',
        isHighYield: card.isHighYield,
      };
    });

    return { success: true as const, cards: formattedCards };
  } catch (error) {
    console.error('Daily Workout Selector Error:', error);
    return { success: false as const, error: 'Failed to select a daily workout.' };
  }
}
