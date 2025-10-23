
'use server';

import { db } from '@/lib/firebase';
import { adminDb } from '@/lib/firebase-admin';
import { addDoc, collection } from 'firebase/firestore';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string(),
  userEmail: z.string().email(),
  personalEmail: z.string().email({ message: 'Please enter a valid personal email.' }),
  regNo: z.string(),
  batch: z.string(),
  isInterested: z.string(), // 'true' or 'false'
});

export async function submitRecruitmentInterest(prevState: any, formData: FormData) {
  const isInterested = formData.get('isInterested') === 'true';

  const validatedFields = formSchema.safeParse({
    name: formData.get('name'),
    userEmail: formData.get('userEmail'),
    personalEmail: isInterested ? formData.get('personalEmail') : 'not-provided@example.com',
    regNo: formData.get('regNo'),
    batch: formData.get('batch'),
    isInterested: formData.get('isInterested'),
  });

  if (!validatedFields.success) {
    return {
      type: 'error' as const,
      message: 'Validation failed.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, userEmail, personalEmail, regNo, batch } = validatedFields.data;

  try {
    // 1. Add submission to the recruitment collection if they are interested
    if (isInterested) {
        await addDoc(collection(db, 'recruitment-submissions'), {
            name,
            userEmail,
            personalEmail,
            regNo,
            batch,
            submittedAt: new Date().toISOString(),
        });
    }

    // 2. Update the user's profile to mark that they have responded
    const usersRef = adminDb.collection('users');
    const q = usersRef.where('email', '==', userEmail).limit(1);
    const userSnapshot = await q.get();

    if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        await userDoc.ref.update({ recruitmentInterestSubmitted: true });
    }

    return {
      type: 'success' as const,
      message: isInterested ? "Thank you for your interest! We'll be in touch soon." : "Thank you for your response.",
    };
  } catch (error) {
    console.error('Error in recruitment submission process:', error);
    return {
      type: 'error' as const,
      message: 'An unexpected error occurred. Please try again.',
    };
  }
}
