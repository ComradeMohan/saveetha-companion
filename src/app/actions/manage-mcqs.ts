
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const McqOptionSchema = z.object({
  key: z.enum(['a', 'b', 'c', 'd']),
  text: z.string(),
});

const McqSchema = z.object({
  questionNumber: z.number(),
  question: z.string(),
  options: z.array(McqOptionSchema),
  correctAnswer: z.enum(['a', 'b', 'c', 'd']),
});

export type Mcq = z.infer<typeof McqSchema>;

const SaveMcqsSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required.'),
  mcqs: z.array(McqSchema).min(1, 'At least one MCQ is required.'),
});

/**
 * Saves a list of MCQs for a specific course to Firestore.
 * This overwrites any existing MCQs for that course.
 */
export async function saveMcqsForCourse(courseId: string, mcqs: Mcq[]) {
  const validation = SaveMcqsSchema.safeParse({ courseId, mcqs });

  if (!validation.success) {
    return {
      type: 'error' as const,
      message: 'Invalid data provided.',
      errors: validation.error.flatten().fieldErrors,
    };
  }

  try {
    const courseMcqDocRef = adminDb.collection('mcqs').doc(courseId);
    
    // The document will store the array of questions directly.
    await courseMcqDocRef.set({
      questions: validation.data.mcqs,
      updatedAt: new Date().toISOString(),
    });

    // Revalidate relevant student-facing pages if they exist
    revalidatePath(`/learn/course/${courseId}`);

    return {
      type: 'success' as const,
      message: `${mcqs.length} MCQs saved successfully for course ${courseId}.`,
    };
  } catch (error) {
    console.error('Error saving MCQs to Firestore:', error);
    return {
      type: 'error' as const,
      message: 'An unexpected error occurred while saving the MCQs.',
    };
  }
}

/**
 * Retrieves the MCQs for a specific course.
 */
export async function getMcqsForCourse(courseId: string): Promise<Mcq[] | null> {
    try {
        const mcqDocRef = doc(db, 'mcqs', courseId);
        const docSnap = await getDoc(mcqDocRef);

        if (docSnap.exists()) {
            // Returns the array of questions
            return docSnap.data().questions as Mcq[];
        }
        return null;
    } catch (error) {
        console.error(`Error fetching MCQs for course ${courseId}:`, error);
        return null;
    }
}


/**
 * Retrieves a list of all courses that have MCQs.
 */
export async function getCoursesWithMcqs() {
    try {
        const snapshot = await adminDb.collection('mcqs').get();
        // The document ID is the course ID
        return snapshot.docs.map(doc => doc.id);
    } catch (error) {
        console.error('Error fetching courses with MCQs:', error);
        return [];
    }
}
