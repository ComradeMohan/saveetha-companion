
'use server';

import { db } from '@/lib/firebase';
import { z } from 'zod';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

const enrollmentSchema = z.object({
  name: z.string().min(1, 'User name is missing.'),
  email: z.string().email('Invalid email address.'),
  slot: z.string().length(1, 'Please select a slot.'),
  courseCode: z.string().regex(/^[A-Z]{3}[0-9]+$/, {
    message: 'Course code must be 3 uppercase letters followed by numbers (e.g., CSE101).',
  }),
});

export async function enrollInCourse(prevState: any, formData: FormData) {
  const validatedFields = enrollmentSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    slot: formData.get('slot'),
    courseCode: formData.get('courseCode'),
  });

  if (!validatedFields.success) {
    return {
      type: 'error',
      message: 'Validation failed.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, slot, courseCode } = validatedFields.data;

  try {
    await addDoc(collection(db, 'enrollments'), {
      name,
      email,
      slot,
      courseCode,
      createdAt: serverTimestamp(),
    });

    return { 
      type: 'success', 
      message: `Successfully enrolled in ${courseCode}!` 
    };
  } catch (error: any) {
    console.error('Error creating enrollment:', error);
    return { type: 'error', message: 'An unexpected error occurred while enrolling.' };
  }
}
