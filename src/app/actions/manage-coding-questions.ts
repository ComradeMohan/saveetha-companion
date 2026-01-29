
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { dummyProblemsByLanguage } from '@/lib/coding-problems';
import type { Problem } from '@/lib/coding-problems';
import { revalidatePath } from 'next/cache';

export interface FetchedProblem extends Problem {
  id: string;
  language: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

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
    
    await batch.commit();
    revalidatePath('/admin/coding-questions');

    return { 
      type: 'success', 
      message: `Successfully seeded ${count} coding questions into the database.` 
    };
  } catch (error: any) {
    console.error("Error seeding coding questions:", error);
    return { type: 'error', message: `An unexpected error occurred: ${error.message}` };
  }
}

export async function getCodingQuestions(): Promise<FetchedProblem[]> {
    try {
        const snapshot = await adminDb.collection('coding-questions').orderBy('language').orderBy('title').get();
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => ({
            ...(doc.data() as Omit<FetchedProblem, 'id'>),
            id: doc.id,
        }));
    } catch (error) {
        console.error("Error fetching coding questions:", error);
        return [];
    }
}
