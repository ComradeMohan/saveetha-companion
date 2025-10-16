'use server';

import { adminDb } from '@/lib/firebase-admin';

/**
 * Distributes 50 credits to all users who do not have a 'credits' field yet.
 * Also sends a notification to each user who receives credits.
 */
export async function distributeInitialCredits(): Promise<{ type: 'success' | 'error', message: string }> {
  try {
    const usersSnapshot = await adminDb.collection('users').get();
    
    if (usersSnapshot.empty) {
      return { type: 'info' as 'success', message: 'No users found in the database.' };
    }

    const batch = adminDb.batch();
    let usersUpdated = 0;
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      
      // Check if 'credits' field is missing or undefined
      if (typeof userData.credits === 'undefined') {
        const userRef = adminDb.collection('users').doc(userDoc.id);
        batch.update(userRef, { credits: 50 });

        const notificationRef = adminDb.collection('user_notifications').doc(userDoc.id).collection('notifications').doc();
        batch.set(notificationRef, {
            message: "You've been awarded 50 credits to use for the course enrollment auto-checker!",
            type: 'credit',
            read: false,
            createdAt: new Date(),
        });

        usersUpdated++;
      }
    }

    if (usersUpdated > 0) {
      await batch.commit();
      return { type: 'success', message: `Successfully distributed 50 credits to ${usersUpdated} users.` };
    } else {
      return { type: 'success', message: 'All users already have a credit balance. No updates were needed.' };
    }

  } catch (error) {
    console.error("Error distributing credits:", error);
    return { type: 'error', message: 'An unexpected error occurred while distributing credits.' };
  }
}
