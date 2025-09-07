'use server';

import { adminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const collegeSchema = z.object({
  id: z.string().min(2, { message: 'College ID must be at least 2 characters.' }),
  name: z.string().min(3, { message: 'College name must be at least 3 characters.' }),
});

export async function addCollege(formData: FormData) {
  const validatedFields = collegeSchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
  });

  if (!validatedFields.success) {
    return { type: 'error', message: 'Validation failed', errors: validatedFields.error.flatten().fieldErrors };
  }

  const { id, name } = validatedFields.data;

  try {
    const collegeRef = adminDb.collection('colleges').doc(id.toUpperCase());
    await collegeRef.set({ name, createdAt: new Date().toISOString() });
    revalidatePath('/admin/college-learnings');
    return { type: 'success', message: 'College added successfully.' };
  } catch (error) {
    console.error('Error adding college:', error);
    return { type: 'error', message: 'Failed to add college.' };
  }
}

export async function deleteCollege(collegeId: string) {
    try {
        // Note: This does not delete subcollections. Firestore requires custom logic for that.
        // For this app, we assume deleting a college means it's just 'soft-deleted' or no longer managed.
        await adminDb.collection('colleges').doc(collegeId).delete();
        revalidatePath('/admin/college-learnings');
        return { type: 'success', message: 'College deleted.' };
    } catch (error) {
        console.error('Error deleting college:', error);
        return { type: 'error', message: 'Failed to delete college.' };
    }
}

export async function getColleges() {
  try {
    const snapshot = await adminDb.collection('colleges').orderBy('name').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching colleges:', error);
    return [];
  }
}
