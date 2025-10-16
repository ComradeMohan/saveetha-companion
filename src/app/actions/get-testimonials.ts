
'use server';

import { adminDb } from '@/lib/firebase-admin';

export interface Testimonial {
  id: string;
  name: string;
  message: string;
}

export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    if (!adminDb.collection) {
      console.warn("Testimonials: Firestore Admin not initialized.");
      return [];
    }
    const snapshot = await adminDb.collection('contact-messages')
      .where('isTestimonial', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get();

    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      message: doc.data().message.replace(/\[Feedback\]\s*/, ''), // Remove feedback prefix
    }));
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return [];
  }
}
