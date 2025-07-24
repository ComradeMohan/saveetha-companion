
'use server';

import { db } from '@/lib/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { z } from 'zod';

const issueFormSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  regNo: z.string().optional(),
  message: z.string().min(10),
  _gotcha: z.string().optional(), // Honeypot field
});


export async function submitIssue(prevState: any, formData: FormData) {
  const validatedFields = issueFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    regNo: formData.get('regNo'),
    message: formData.get('message'),
    _gotcha: formData.get('_gotcha'),
  });

  if (!validatedFields.success) {
    return {
        type: 'error',
        message: 'Validation failed.',
        errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // Honeypot check
  if (validatedFields.data._gotcha) {
    // This is likely a bot. Return success without saving to the DB.
    return { type: 'success', message: 'Report submitted successfully!' };
  }
  
  const { name, email, regNo, message } = validatedFields.data;

  try {
    await addDoc(collection(db, 'login-issues'), {
        name,
        email,
        regNo: regNo || 'Not Provided',
        message,
        status: 'Unread',
        createdAt: new Date().toISOString(),
    });
    return { type: 'success', message: "We've received your report and will get back to you soon." };
  } catch (error) {
    console.error('Error submitting issue:', error);
    return { type: 'error', message: 'Could not send your report. Please try again later.' };
  }
}
