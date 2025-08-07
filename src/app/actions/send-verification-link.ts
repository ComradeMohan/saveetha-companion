
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { z } from 'zod';

const formSchema = z.object({
  email: z.string().email(),
});

export async function generateVerificationLink(email: string) {
  const validatedFields = formSchema.safeParse({ email });

  if (!validatedFields.success) {
    return {
      type: 'error',
      message: 'Invalid email address provided.',
    };
  }

  try {
    const actionCodeSettings = {
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/login`,
      handleCodeInApp: true,
    };

    const link = await getAuth().generateEmailVerificationLink(email, actionCodeSettings);
    
    return { 
        type: 'success', 
        message: 'Verification link generated.',
        link: link,
    };

  } catch (error: any) {
    console.error('Error generating verification link:', error);
    if (error.code === 'auth/user-not-found') {
        return { type: 'error', message: 'User with this email does not exist.' };
    }
    return { type: 'error', message: 'An unexpected error occurred.' };
  }
}
