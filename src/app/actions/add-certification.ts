
'use server';

import { db } from '@/lib/firebase';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { collection, writeBatch, doc, getDoc, serverTimestamp, runTransaction } from 'firebase/firestore';
import { adminDb } from '@/lib/firebase-admin';

const certificationSchema = z.object({
  title: z.string().min(1, { message: 'Title is required.' }),
  description: z.string().min(1, { message: 'Description is required.' }),
  provider: z.string().min(1, { message: 'Provider is required.' }),
  url: z.string().url({ message: "Please enter a valid URL." }),
});

/**
 * For Batch Admins. Uses a transaction to ensure atomic writes for certification and activity log.
 * This function operates under the batch admin's client-side permissions.
 */
export async function addCertificationForBatchAdmin(prevState: any, formData: FormData) {
  const validatedFields = certificationSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    provider: formData.get('provider'),
    url: formData.get('url'),
  });

  const userId = formData.get('userId') as string;

  if (!validatedFields.success) {
    return {
      type: 'error',
      message: 'Validation failed.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  if (!userId) {
    return { type: 'error', message: 'User is not authenticated.' };
  }

  const { title, description, url, provider } = validatedFields.data;

  try {
    await runTransaction(db, async (transaction) => {
        const batchAdminRef = doc(db, 'batchAdmins', userId);
        const batchAdminSnap = await transaction.get(batchAdminRef);

        if (!batchAdminSnap.exists()) {
            throw new Error('Permission Denied. You might not have the required roles to perform this action.');
        }

        // 1. Create the new certification document
        const newCertRef = doc(collection(db, 'certifications'));
        transaction.set(newCertRef, {
            title,
            description,
            url,
            provider,
            createdBy: userId,
            createdAt: serverTimestamp(),
        });

        // 2. Create the activity log document
        const activityRef = doc(collection(db, 'batchAdmins', userId, 'activity'));
        transaction.set(activityRef, {
            action: `Added certification: "${title}"`,
            contentType: 'certification',
            contentId: newCertRef.id,
            timestamp: serverTimestamp(),
        });
    });

    revalidatePath('/admin/certifications');
    revalidatePath('/certifications');
    revalidatePath('/batch-admin/certifications');

    return {
      type: 'success',
      message: `Certification '${title}' added successfully!`
    };

  } catch (error: any) {
    console.error('[TRANSACTION_ERROR] addCertificationForBatchAdmin:', error);
    // Check for specific permission denied error from transaction
    if (error.message.includes('Permission Denied')) {
        return { type: 'error', message: 'Permission Denied. You might not have the required roles to perform this action.' };
    }
    return { type: 'error', message: 'An unexpected firebase error occurred while adding the certification.' };
  }
}


/**
 * For Main Admins. Uses the Admin SDK to bypass security rules for direct creation.
 * No activity logging is performed for the main admin.
 */
export async function addCertificationForAdmin(prevState: any, formData: FormData) {
    const validatedFields = certificationSchema.safeParse({
        title: formData.get('title'),
        description: formData.get('description'),
        provider: formData.get('provider'),
        url: formData.get('url'),
    });

     if (!validatedFields.success) {
        return {
            type: 'error' as const,
            message: 'Validation failed.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { title, description, url, provider } = validatedFields.data;
    
    try {
        await adminDb.collection('certifications').add({
            title,
            description,
            url,
            provider,
            createdBy: 'admin',
            createdAt: new Date().toISOString(),
        });

        revalidatePath('/admin/certifications');
        revalidatePath('/certifications');

        return {
            type: 'success' as const,
            message: `Certification '${title}' added successfully!`
        };
    } catch (error) {
        console.error('Error adding certification as admin:', error);
        return {
            type: 'error' as const,
            message: 'An unexpected error occurred.'
        };
    }
}
