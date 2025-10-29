
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export interface BatchAdmin {
  id: string; // This will be the user's UID
  email: string;
  batch: string;
}

const addSchema = z.object({
  userId: z.string().min(1, 'User ID is required.'),
  email: z.string().email('A valid email is required.'),
  batch: z.string().regex(/^\d{4}$/, 'Batch must be a 4-digit year.'),
});

export async function addBatchAdmin(formData: FormData) {
  const validatedFields = addSchema.safeParse({
    userId: formData.get('userId'),
    email: formData.get('email'),
    batch: formData.get('batch'),
  });

  if (!validatedFields.success) {
    return { type: 'error', message: 'Validation failed.', errors: validatedFields.error.flatten().fieldErrors };
  }
  
  const { userId, email, batch } = validatedFields.data;

  try {
    const adminRef = adminDb.collection('batchAdmins').doc(userId);
    const userRef = adminDb.collection('users').doc(userId);

    // Use a batch to perform both writes atomically
    const batchWrite = adminDb.batch();
    batchWrite.set(adminRef, { email, batch });
    batchWrite.update(userRef, { isBatchAdmin: true }); // Also mark on the user doc
    
    await batchWrite.commit();
    
    revalidatePath('/admin/batch-admin');
    return { type: 'success', message: `User ${email} has been made a batch admin.` };
  } catch (error) {
    console.error('Error adding batch admin:', error);
    return { type: 'error', message: 'Failed to add batch admin.' };
  }
}

export async function removeBatchAdmin(userId: string) {
  try {
    const adminRef = adminDb.collection('batchAdmins').doc(userId);
    const userRef = adminDb.collection('users').doc(userId);

    const batchWrite = adminDb.batch();
    batchWrite.delete(adminRef);
    batchWrite.update(userRef, { isBatchAdmin: false });
    
    await batchWrite.commit();

    revalidatePath('/admin/batch-admin');
    return { type: 'success', message: 'Batch admin removed.' };
  } catch (error) {
    console.error('Error removing batch admin:', error);
    return { type: 'error', message: 'Failed to remove batch admin.' };
  }
}

export async function getBatchAdmins(): Promise<BatchAdmin[]> {
  try {
    const snapshot = await adminDb.collection('batchAdmins').get();
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map(doc => ({
      id: doc.id,
      email: doc.data().email,
      batch: doc.data().batch,
    }));
  } catch (error) {
    console.error('Error fetching batch admins:', error);
    return [];
  }
}
