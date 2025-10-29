
'use server';

import { db } from '@/lib/firebase';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { collection, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';

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
    const newCertRef = await addDoc(collection(db, 'certifications'), {
      title,
      description,
      url,
      provider,
      createdBy: userId,
      createdAt: serverTimestamp(),
    });

    // Attempt to log activity for batch admins.
    // This will fail silently for non-batch-admins due to security rules, which is expected.
    try {
        const activityCollection = collection(db, 'batchAdmins', userId, 'activity');
        await addDoc(activityCollection, {
            action: `Added certification: "${title}"`,
            contentType: 'certification',
            contentId: newCertRef.id,
            timestamp: serverTimestamp(),
        });
    } catch (activityError) {
        // This error is expected for users who are not batch admins.
        // We can log it on the server for debugging but won't show it to the user.
        console.log(`[Info] Could not log activity for user ${userId}. This is expected if they are not a batch admin.`);
    }


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
    return { type: 'error', message: 'An unexpected firebase error occurred while adding the certification.' };
  }
}
