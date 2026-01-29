
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { z } from 'zod';
import { sendRecruitmentEmail } from './send-recruitment-email';
import { FieldValue } from 'firebase-admin/firestore';

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
    const usersRef = adminDb.collection('users');
    const q = usersRef.where('email', '==', userEmail).limit(1);
    const userSnapshot = await q.get();

    if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        // 1. Update the user's profile to mark that they have responded
        await userDoc.ref.update({ recruitmentInterestSubmitted: true });
        
        // 2. Add submission to the recruitment collection if they are interested
        if (isInterested) {
            await adminDb.collection('recruitment-submissions').add({
                name,
                userEmail,
                personalEmail,
                regNo,
                batch,
                submittedAt: FieldValue.serverTimestamp(),
            });

            // 3. Send notification email
            await sendRecruitmentEmail({ name, userEmail, personalEmail, regNo, batch });
        }
    } else {
         throw new Error("Could not find user profile to update.");
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
