'use server';

import { adminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const departmentSchema = z.object({
  collegeId: z.string(),
  id: z.string().min(2, { message: 'Department ID must be at least 2 characters.' }),
  name: z.string().min(3, { message: 'Department name must be at least 3 characters.' }),
});

export async function addDepartment(formData: FormData) {
  const validatedFields = departmentSchema.safeParse({
    collegeId: formData.get('collegeId'),
    id: formData.get('id'),
    name: formData.get('name'),
  });

  if (!validatedFields.success) {
    return { type: 'error', message: 'Validation failed', errors: validatedFields.error.flatten().fieldErrors };
  }
  
  const { collegeId, id, name } = validatedFields.data;

  try {
    const deptRef = adminDb.collection('colleges').doc(collegeId).collection('departments').doc(id.toUpperCase());
    await deptRef.set({ name, createdAt: new Date().toISOString() });
    revalidatePath('/admin/college-learnings');
    return { type: 'success', message: 'Department added successfully.' };
  } catch (error) {
    console.error('Error adding department:', error);
    return { type: 'error', message: 'Failed to add department.' };
  }
}

export async function deleteDepartment(collegeId: string, departmentId: string) {
    try {
        await adminDb.collection('colleges').doc(collegeId).collection('departments').doc(departmentId).delete();
        revalidatePath('/admin/college-learnings');
        return { type: 'success', message: 'Department deleted.' };
    } catch (error) {
        console.error('Error deleting department:', error);
        return { type: 'error', message: 'Failed to delete department.' };
    }
}

export async function getDepartments(collegeId: string) {
  if (!collegeId) return [];
  try {
    const snapshot = await adminDb.collection('colleges').doc(collegeId).collection('departments').orderBy('name').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching departments:', error);
    return [];
  }
}
