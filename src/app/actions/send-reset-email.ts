
'use server';

import { getAuth } from 'firebase-admin/auth';
import { z } from 'zod';

const formSchema = z.object({
  email: z.string().email(),
});

export async function sendPasswordResetLink(email: string) {
  const validatedFields = formSchema.safeParse({ email });

  if (!validatedFields.success) {
    return {
      type: 'error',
      message: 'Invalid email address provided.',
    };
  }

  try {
    const link = await getAuth().generatePasswordResetLink(email, {
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/login`,
    });

    const emailSubject = "Verify Your Email and Reset Your Password for Saveetha Companion";
    const emailBody = `Hello,\n\nPlease use the following link to reset your password. This will also verify your email address.\n\nLink: ${link}\n\nIf you did not request this, please ignore this email.\n\nThanks,\nThe Saveetha Companion Team`;
    
    const mailto = `mailto:${email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    return { 
        type: 'success', 
        message: 'Password reset link generated.',
        mailto: mailto,
    };

  } catch (error: any) {
    console.error('Error generating password reset link:', error);
    if (error.code === 'auth/user-not-found') {
        return { type: 'error', message: 'User with this email does not exist.' };
    }
    return { type: 'error', message: 'An unexpected error occurred.' };
  }
}
