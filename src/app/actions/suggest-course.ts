
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { z } from 'zod';
import { getAuth } from 'firebase-admin/auth';
import { headers } from 'next/headers';
import { app } from '@/lib/firebase'; // Ensure client-app is initialized

const courseSchema = z.object({
  code: z.string().min(2).regex(/^[A-Z]{3}\d+$/),
  name: z.string().min(3),
});

export async function suggestCourse(values: z.infer<typeof courseSchema>) {
  const validatedFields = courseSchema.safeParse(values);

  if (!validatedFields.success) {
    return { type: 'error', message: 'Invalid data provided.' };
  }
  
  const headersList = headers();
  const authorization = headersList.get('authorization');

  if (!authorization) {
      return { type: 'error', message: 'User not authenticated.' };
  }
  
  const token = authorization.split('Bearer ')[1];
  let user;
  try {
    user = await getAuth(app).verifyIdToken(token);
  } catch (error) {
    console.error("Token verification failed", error);
    return { type: 'error', message: 'Authentication failed.' };
  }

  const { code, name } = validatedFields.data;

  try {
    await adminDb.collection('course-suggestions').add({
      courseCode: code,
      courseName: name,
      suggestedBy: user.uid,
      suggesterEmail: user.email,
      status: 'pending',
      createdAt: adminDb.FieldValue.serverTimestamp(),
    });

    return { type: 'success', message: 'Suggestion submitted successfully!' };
  } catch (error) {
    console.error('Error suggesting course:', error);
    return { type: 'error', message: 'Failed to submit suggestion.' };
  }
}
