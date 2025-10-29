
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { FieldValue } from 'firebase-admin/firestore';

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
    const batch = adminDb.batch();

    // 1. Create the certification document
    const newCertRef = adminDb.collection('certifications').doc();
    batch.set(newCertRef, {
        title,
        description,
        url,
        provider,
        createdBy: userId, // Required by security rules
        createdAt: FieldValue.serverTimestamp(),
    });

    // 2. Check if the user is a batch admin
    const batchAdminRef = adminDb.collection('batchAdmins').doc(userId);
    const batchAdminSnap = await batchAdminRef.get();
    
    // 3. If they are, log the activity
    if (batchAdminSnap.exists()) {
        const activityRef = adminDb.collection('batchAdmins', userId, 'activity').doc();
        batch.set(activityRef, {
            action: `Added certification: "${title}"`,
            contentType: 'certification',
            contentId: newCertRef.id,
            timestamp: FieldValue.serverTimestamp(),
        });
    }

    // 4. Commit both writes together
    await batch.commit();

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
    if (error.code === 'permission-denied' || (error.details && error.details.includes('PERMISSION_DENIED'))) {
         return { type: 'error', message: 'Permission Denied. You might not have the required roles to perform this action.' };
    }
    return { type: 'error', message: 'An unexpected firebase error occurred while adding the certification.' };
  }
}
