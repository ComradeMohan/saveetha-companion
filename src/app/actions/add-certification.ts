
'use server';

import { db } from '@/lib/firebase';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { collection, addDoc, serverTimestamp, getDoc, doc, runTransaction } from 'firebase/firestore';

const certificationSchema = z.object({
  title: z.string().min(1, { message: 'Title is required.' }),
  description: z.string().min(1, { message: 'Description is required.' }),
  provider: z.string().min(1, { message: 'Provider is required.' }),
  url: z.string().url({ message: "Please enter a valid URL." }),
  userId: z.string().optional(), // ID of the user performing the action
});

export async function addCertification(prevState: any, formData: FormData) {
  const validatedFields = certificationSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    provider: formData.get('provider'),
    url: formData.get('url'),
    userId: formData.get('userId'),
  });

  if (!validatedFields.success) {
    return {
      type: 'error',
      message: 'Validation failed.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const { title, description, url, provider, userId } = validatedFields.data;
  
  if (!userId) {
      return { type: 'error', message: 'User is not authenticated.' };
  }

  try {
    // Use a transaction to ensure both writes succeed or fail together.
    await runTransaction(db, async (transaction) => {
        const batchAdminRef = doc(db, 'batchAdmins', userId);
        const batchAdminSnap = await transaction.get(batchAdminRef);
        
        // This is the primary operation: create the certification.
        const newCertRef = doc(collection(db, 'certifications'));
        transaction.set(newCertRef, {
            title,
            description,
            url,
            provider,
            createdBy: userId,
            createdAt: serverTimestamp(),
        });
        
        // This is the secondary operation: log activity if user is a batch admin.
        if (batchAdminSnap.exists()) {
             const activityRef = doc(collection(db, 'batchAdmins', userId, 'activity'));
             transaction.set(activityRef, {
                action: `Added certification: "${title}"`,
                contentType: 'certification',
                contentId: newCertRef.id,
                timestamp: serverTimestamp(),
            });
        }
    });

    // Revalidate paths so fresh data shows up
    revalidatePath('/admin/certifications');
    revalidatePath('/certifications');
    revalidatePath('/batch-admin/certifications');

    return { 
      type: 'success', 
      message: `Certification '${title}' added successfully!` 
    };
  } catch (error: any) {
    console.error('[Critical] An unexpected Firebase error occurred during certification creation:', error);
    if (error.code === 'permission-denied') {
         return { type: 'error', message: 'Permission Denied. You might not have the required roles to perform this action.' };
    }
    return { type: 'error', message: 'An unexpected firebase error occurred while adding the certification.' };
  }
}
