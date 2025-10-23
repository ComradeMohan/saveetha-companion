
'use server';

import { db } from '@/lib/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string(),
  userEmail: z.string().email(),
  personalEmail: z.string().email({ message: 'Please enter a valid personal email.' }),
  regNo: z.string(),
  batch: z.string(),
});

export async function submitRecruitmentInterest(prevState: any, formData: FormData) {
  const validatedFields = formSchema.safeParse({
    name: formData.get('name'),
    userEmail: formData.get('userEmail'),
    personalEmail: formData.get('personalEmail'),
    regNo: formData.get('regNo'),
    batch: formData.get('batch'),
  });

  if (!validatedFields.success) {
    return {
      type: 'error',
      message: 'Validation failed.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await addDoc(collection(db, 'recruitment-submissions'), {
      ...validatedFields.data,
      submittedAt: new Date().toISOString(),
    });

    return {
      type: 'success',
      message: "Thank you for your interest! We'll be in touch soon.",
    };
  } catch (error) {
    console.error('Error submitting recruitment interest:', error);
    return {
      type: 'error',
      message: 'An unexpected error occurred. Please try again.',
    };
  }
}
