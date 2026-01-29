
'use server';

import { db } from '@/lib/firebase';
import { adminDb } from '@/lib/firebase-admin';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string(), // Automatically filled
  email: z.string().email(), // Automatically filled
  uid: z.string().min(1, 'User ID is missing.'),
  feedback: z.string().min(10, { message: 'Feedback must be at least 10 characters.' }),
});

export async function sendFeedback(prevState: any, formData: FormData) {
  const validatedFields = formSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    uid: formData.get('uid'),
    feedback: formData.get('feedback'),
  });

  if (!validatedFields.success) {
    return {
      type: 'error',
      message: 'Validation failed.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, uid, feedback } = validatedFields.data;

  try {
    // 1. Store in the public contact messages collection
    await addDoc(collection(db, 'contact-messages'), {
      name,
      email,
      message: `[Feedback] ${feedback}`, // Prefix to identify it as feedback
      status: 'Unread',
      createdAt: new Date().toISOString(),
    });

    // 2. Update the user's profile to mark feedback as submitted using the Admin SDK
    const userRef = adminDb.collection('users').doc(uid);
    await userRef.update({ feedbackSubmitted: true });

    return {
      type: 'success',
      message: "Thank you! Your feedback has been sent successfully.",
    };
  } catch (error) {
    console.error('Error sending feedback:', error);
    return {
      type: 'error',
      message: 'An unexpected error occurred. Please try again.',
    };
  }
}
