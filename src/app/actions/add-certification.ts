
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
  console.log('[Debug] addCertification action initiated.');

  const validatedFields = certificationSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    provider: formData.get('provider'),
    url: formData.get('url'),
    userId: formData.get('userId'),
  });

  if (!validatedFields.success) {
    console.error('[Debug] Validation failed:', validatedFields.error.flatten());
    return {
      type: 'error',
      message: 'Validation failed.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  console.log('[Debug] Validation successful.');

  const { title, description, url, provider, userId } = validatedFields.data;
  
  if (!userId) {
      console.error('[Debug] Error: User is not authenticated. userId is missing.');
      return { type: 'error', message: 'User is not authenticated.' };
  }
  
  console.log(`[Debug] User ID: ${userId}, Title: ${title}`);

  try {
    console.log('[Debug] Attempting to add certification document...');
    const newCertRef = await addDoc(collection(db, 'certifications'), {
      title,
      description,
      url,
      provider,
      createdBy: userId,
      createdAt: serverTimestamp(),
    });
    console.log(`[Debug] Certification document created with ID: ${newCertRef.id}`);

    const batchAdminRef = doc(db, 'batchAdmins', userId);
    console.log(`[Debug] Checking if user is a batch admin at path: ${batchAdminRef.path}`);
    const batchAdminDoc = await getDoc(batchAdminRef);

    if (batchAdminDoc.exists()) {
        console.log('[Debug] User is a batch admin. Attempting to log activity.');
        const activityCollection = collection(db, 'batchAdmins', userId, 'activity');
        await addDoc(activityCollection, {
            action: `Added certification: "${title}"`,
            contentType: 'certification',
            contentId: newCertRef.id,
            timestamp: serverTimestamp(),
        });
        console.log('[Debug] Activity logged successfully.');
    } else {
        console.log('[Debug] User is not a batch admin. Skipping activity log.');
    }

    // Revalidate paths so fresh data shows up
    revalidatePath('/admin/certifications');
    revalidatePath('/certifications');
    revalidatePath('/batch-admin/certifications');

    console.log('[Debug] Action completed successfully.');
    return { 
      type: 'success', 
      message: `Certification '${title}' added successfully!` 
    };
  } catch (error: any) {
    console.error('[Debug] An unexpected Firebase error occurred:', error);
    return { type: 'error', message: 'An unexpected firebase error occurred while adding the certification.' };
  }
}
