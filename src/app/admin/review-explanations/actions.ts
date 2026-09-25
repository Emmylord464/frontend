'use server';

import { db } from '@/db';
import { pastQuestions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

/** Mark explanation as human-reviewed and approved */
export async function approveExplanation(id: string, explanation: string) {
  await db
    .update(pastQuestions)
    .set({
      explanation,
      explanationReviewed: true,
    })
    .where(eq(pastQuestions.id, id));

  revalidatePath('/admin/review-explanations');
}

/** Reset explanation back to placeholder so the enrichment script regenerates it */
export async function rejectExplanation(id: string) {
  await db
    .update(pastQuestions)
    .set({
      explanation:         'Official JAMB past question answer key.',
      explanationSource:   'placeholder',
      explanationReviewed: false,
    })
    .where(eq(pastQuestions.id, id));

  revalidatePath('/admin/review-explanations');
}

/** Save an edited explanation and mark it as human-reviewed */
export async function editExplanation(id: string, newExplanation: string) {
  await db
    .update(pastQuestions)
    .set({
      explanation:         newExplanation,
      explanationSource:   'human_reviewed',
      explanationReviewed: true,
    })
    .where(eq(pastQuestions.id, id));

  revalidatePath('/admin/review-explanations');
}

