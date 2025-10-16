
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';

export async function toggleTestimonialStatus(messageId: string, isTestimonial: boolean) {
  try {
    if (!adminDb.collection) {
      throw new Error("Firestore Admin not initialized.");
    }

    const messageRef = adminDb.collection('contact-messages').doc(messageId);
    await messageRef.update({ isTestimonial });

    // Revalidate the homepage to show new testimonials
    revalidatePath('/');

    return { 
        type: 'success' as const, 
        message: isTestimonial ? 'Message added to testimonials.' : 'Message removed from testimonials.' 
    };
  } catch (error: any) {
    console.error("Error toggling testimonial status:", error);
    return { 
        type: 'error' as const, 
        message: 'An unexpected error occurred.' 
    };
  }
}
