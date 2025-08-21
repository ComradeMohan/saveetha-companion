
'use server';

import { db } from '@/lib/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string(), // Automatically filled
  email: z.string().email(), // Automatically filled
  feedback: z.string().min(10, { message: 'Feedback must be at least 10 characters.' }),
});

export async function sendFeedback(prevState: any, formData: FormData) {
  const validatedFields = formSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    feedback: formData.get('feedback'),
  });

  if (!validatedFields.success) {
    return {
      type: 'error',
      message: 'Validation failed.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    // Store in the same collection as contact messages
    await addDoc(collection(db, 'contact-messages'), {
      name: validatedFields.data.name,
      email: validatedFields.data.email,
      message: `[Feedback] ${validatedFields.data.feedback}`, // Prefix to identify it as feedback
      status: 'Unread',
      createdAt: new Date().toISOString(),
    });

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
