
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

export const effectTypes = ['snow', 'fireworks', 'confetti'] as const;
export type EffectType = (typeof effectTypes)[number];

export interface SpecialEvent {
  id: string;
  date: string; // YYYY-MM-DD format
  message: string;
  effect: EffectType;
}

const eventSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format.'),
  message: z.string().min(1, 'Message is required.'),
  effect: z.enum(effectTypes),
});

export async function addSpecialEvent(prevState: any, formData: FormData) {
  const validatedFields = eventSchema.safeParse({
    date: formData.get('date'),
    message: formData.get('message'),
    effect: formData.get('effect'),
  });

  if (!validatedFields.success) {
    return {
      type: 'error' as const,
      message: 'Validation failed.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { date, message, effect } = validatedFields.data;

  try {
    const eventData = { date, message, effect, createdAt: new Date().toISOString() };
    await adminDb.collection('specialEvents').add(eventData);

    revalidatePath('/admin/effects');
    
    return {
      type: 'success' as const,
      message: 'Special event added successfully!',
    };
  } catch (error: any) {
    console.error('Error adding special event:', error);
    return { type: 'error' as const, message: 'An unexpected error occurred.' };
  }
}

export async function getSpecialEvents(): Promise<SpecialEvent[]> {
  try {
    const snapshot = await adminDb.collection('specialEvents').orderBy('date', 'asc').get();
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as SpecialEvent));
  } catch (error) {
    console.error('Error fetching special events:', error);
    return [];
  }
}

export async function deleteSpecialEvent(id: string): Promise<{ type: 'success' | 'error', message: string }> {
    if (!id) {
        return { type: 'error', message: 'Invalid ID provided.' };
    }
    try {
        await adminDb.collection('specialEvents').doc(id).delete();
        revalidatePath('/admin/effects');
        return { type: 'success', message: 'Event deleted successfully.' };
    } catch (error) {
        console.error('Error deleting special event:', error);
        return { type: 'error', message: 'An unexpected error occurred.' };
    }
}
