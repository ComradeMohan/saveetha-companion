
'use server';

import { adminDb } from '@/lib/firebase-admin';

/**
 * @fileOverview Server action for seeding the initial visitor count.
 * - seedInitialCount: Sets an initial visitor count in the 'counter' collection.
 */

export async function seedInitialCount(): Promise<{ type: 'success' | 'error', message: string }> {
  try {
    if (!adminDb.collection) {
      console.warn("Analytics: Firestore Admin not initialized, skipping seed.");
      return { type: 'error', message: 'Firestore Admin not initialized.' };
    }

    // Use a specific document ID, e.g., 'visits', for easy retrieval.
    const counterRef = adminDb.collection('counter').doc('visits');
    
    await counterRef.set({
      count: 4147
    });

    return { type: 'success', message: 'Successfully seeded visitor count to 4147.' };
  } catch (error: any) {
    console.error("Error seeding counter:", error);
    return { type: 'error', message: `An unexpected error occurred: ${error.message}` };
  }
}
