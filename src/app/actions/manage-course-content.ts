
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Define types for stricter control
export type Unit = { id: string; title: string; order: number; };
export type Topic = { id: string; title: string; notes?: string; videoUrl?: string; questions?: string; };

const unitSchema = z.object({
  title: z.string().min(3, { message: 'Unit title must be at least 3 characters.' }),
  order: z.number().int().positive(),
});

const topicSchema = z.object({
    title: z.string().min(3, 'Title is required.'),
    notes: z.string().optional(),
    videoUrl: z.string().url().or(z.literal('')).optional(),
    questions: z.string().optional(),
});


// Helper to get the units collection reference
const getUnitsCollection = (collegeId: string, departmentId: string, courseId: string) => {
    return adminDb.collection('colleges').doc(collegeId).collection('departments').doc(departmentId).collection('courses').doc(courseId).collection('units');
}

// Helper to get the topics collection reference
const getTopicsCollection = (collegeId: string, departmentId: string, courseId: string, unitId: string) => {
    return getUnitsCollection(collegeId, departmentId, courseId).doc(unitId).collection('topics');
}


// Units Management
export async function addUnit(collegeId: string, departmentId: string, courseId: string, title: string, order: number) {
  const validatedFields = unitSchema.safeParse({ title, order });
  if (!validatedFields.success) {
    return { type: 'error', message: 'Validation failed', errors: validatedFields.error.flatten().fieldErrors };
  }

  try {
    const unitRef = getUnitsCollection(collegeId, departmentId, courseId).doc();
    await unitRef.set({ ...validatedFields.data, createdAt: new Date().toISOString() });
    return { type: 'success', message: 'Unit added successfully.' };
  } catch (error) {
    console.error('Error adding unit:', error);
    return { type: 'error', message: 'Failed to add unit.' };
  }
}

export async function deleteUnit(collegeId: string, departmentId: string, courseId: string, unitId: string) {
    try {
        await getUnitsCollection(collegeId, departmentId, courseId).doc(unitId).delete();
        // Note: Deleting a unit does not automatically delete its subcollections (topics).
        // For this app's scope, we'll assume this is acceptable. A production app might need a Cloud Function for recursive deletes.
        return { type: 'success', message: 'Unit deleted.' };
    } catch (error) {
        console.error('Error deleting unit:', error);
        return { type: 'error', message: 'Failed to delete unit.' };
    }
}

export async function getUnits(collegeId: string, departmentId: string, courseId: string) {
  try {
    const snapshot = await getUnitsCollection(collegeId, departmentId, courseId).orderBy('order').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Unit[];
  } catch (error) {
    console.error('Error fetching units:', error);
    return [];
  }
}


// Topics Management
export async function addTopic(collegeId: string, departmentId: string, courseId: string, unitId: string, formData: FormData) {
  const validatedFields = topicSchema.safeParse({
    title: formData.get('title'),
    notes: formData.get('notes'),
    videoUrl: formData.get('videoUrl'),
    questions: formData.get('questions'),
  });

  if (!validatedFields.success) {
    return { type: 'error', message: 'Validation failed.', errors: validatedFields.error.flatten().fieldErrors };
  }
  
  const { title, notes, videoUrl, questions } = validatedFields.data;

  try {
    const topicRef = getTopicsCollection(collegeId, departmentId, courseId, unitId).doc();
    await topicRef.set({ title, notes, videoUrl, questions, createdAt: new Date().toISOString() });
    return { type: 'success', message: 'Topic added successfully.' };
  } catch (error) {
    console.error('Error adding topic:', error);
    return { type: 'error', message: 'Failed to add topic.' };
  }
}

export async function deleteTopic(collegeId: string, departmentId: string, courseId: string, unitId: string, topicId: string) {
    try {
        await getTopicsCollection(collegeId, departmentId, courseId, unitId).doc(topicId).delete();
        return { type: 'success', message: 'Topic deleted.' };
    } catch (error) {
        console.error('Error deleting topic:', error);
        return { type: 'error', message: 'Failed to delete topic.' };
    }
}

export async function getTopics(collegeId: string, departmentId: string, courseId: string, unitId: string): Promise<Topic[]> {
  try {
    const snapshot = await getTopicsCollection(collegeId, departmentId, courseId, unitId).orderBy('createdAt').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Topic[];
  } catch (error) {
    console.error('Error fetching topics:', error);
    return [];
  }
}

