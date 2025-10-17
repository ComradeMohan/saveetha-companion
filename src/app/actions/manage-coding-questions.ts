
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { dummyProblemsByLanguage } from '@/lib/coding-problems';

export async function seedCodingQuestions(): Promise<{ type: 'success' | 'error', message: string }> {
  try {
    const batch = adminDb.batch();
    const questionsCollection = adminDb.collection('coding-questions');
    let count = 0;

    for (const [language, difficulties] of Object.entries(dummyProblemsByLanguage)) {
      for (const [difficulty, problems] of Object.entries(difficulties)) {
        for (const problem of problems) {
          const docRef = questionsCollection.doc(); // Auto-generate ID
          batch.set(docRef, {
            ...problem,
            language: language,
            difficulty: difficulty,
            createdAt: new Date().toISOString(),
          });
          count++;
        }
      }
    }
    
    // Note: You may want to clear the collection first if you intend this to be a reset operation.
    // For now, it will just add the questions.

    await batch.commit();

    return { 
      type: 'success', 
      message: `Successfully seeded ${count} coding questions into the database.` 
    };
  } catch (error: any) {
    console.error("Error seeding coding questions:", error);
    return { type: 'error', message: `An unexpected error occurred: ${error.message}` };
  }
}
