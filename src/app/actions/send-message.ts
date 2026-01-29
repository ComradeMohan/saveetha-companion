
'use server';

import { db } from '@/lib/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
});

export async function sendMessage(prevState: any, formData: FormData) {
  const validatedFields = formSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  });

  if (!validatedFields.success) {
    return {
      type: 'error',
      message: 'Validation failed.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await addDoc(collection(db, 'contact-messages'), {
      ...validatedFields.data,
      status: 'Unread',
      createdAt: new Date().toISOString(),
    });

    return {
      type: 'success',
      message: "Message Sent! We'll get back to you as soon as possible.",
    };
  } catch (error) {
    console.error('Error sending message:', error);
    return {
      type: 'error',
      message: 'An unexpected error occurred. Please try again.',
    };
  }
}
