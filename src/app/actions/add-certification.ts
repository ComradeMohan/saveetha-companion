
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
  console.log('[DEBUG] addCertificationForBatchAdmin started.');
  const validatedFields = certificationSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    provider: formData.get('provider'),
    url: formData.get('url'),
  });

  const userId = formData.get('userId') as string;
  console.log(`[DEBUG] UserID: ${userId}`);

  if (!validatedFields.success) {
    console.log('[DEBUG] Validation failed:', validatedFields.error.flatten().fieldErrors);
    return {
      type: 'error',
      message: 'Validation failed.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
   console.log('[DEBUG] Validation successful.');

  if (!userId) {
    console.log('[DEBUG] User ID is missing.');
    return { type: 'error', message: 'User is not authenticated.' };
  }

  const { title, description, url, provider } = validatedFields.data;

  try {
    console.log('[DEBUG] Starting Firestore transaction...');
    await runTransaction(db, async (transaction) => {
        const batchAdminRef = doc(db, 'batchAdmins', userId);
        console.log(`[DEBUG] Transaction: Attempting to get doc at path: ${batchAdminRef.path}`);
        const batchAdminSnap = await transaction.get(batchAdminRef);

        if (!batchAdminSnap.exists()) {
            console.log('[DEBUG] Transaction: Batch admin document does not exist. Aborting.');
            throw new Error('Permission Denied. You might not have the required roles to perform this action.');
        }
        console.log('[DEBUG] Transaction: Batch admin document found.');

        // 1. Create the new certification document
        const newCertRef = doc(collection(db, 'certifications'));
        const newCertData = {
            title,
            description,
            url,
            provider,
            createdBy: userId,
            createdAt: serverTimestamp(),
        };
        console.log('[DEBUG] Transaction: Setting new certification data:', newCertData);
        transaction.set(newCertRef, newCertData);

        // 2. Create the activity log document
        const activityRef = doc(collection(db, 'batchAdmins', userId, 'activity'));
        const newActivityData = {
            action: `Added certification: "${title}"`,
            contentType: 'certification',
            contentId: newCertRef.id,
            timestamp: serverTimestamp(),
        };
        console.log('[DEBUG] Transaction: Setting new activity data:', newActivityData);
        transaction.set(activityRef, newActivityData);
    });
    console.log('[DEBUG] Transaction completed successfully.');

    revalidatePath('/admin/certifications');
    revalidatePath('/certifications');
    revalidatePath('/batch-admin/certifications');

    return {
      type: 'success',
      message: `Certification '${title}' added successfully!`
    };

  } catch (error: any) {
    console.error('[TRANSACTION_ERROR] addCertificationForBatchAdmin:', error);
    // Log the full error object for detailed debugging
    console.error('[FULL_ERROR_OBJECT]', JSON.stringify(error, null, 2));

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
            createdBy: 'admin', // Main admin is the creator
            createdAt: new Date().toISOString(),
        });

        revalidatePath('/admin/certifications');
        revalidatePath('/certifications');
        revalidatePath('/batch-admin/certifications');

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
