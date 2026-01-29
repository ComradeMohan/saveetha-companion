'use server';

import { adminDb } from '@/lib/firebase-admin';

/**
 * Retrieves the referral count for a specific user.
 * @param userId The UID of the user (the referrer).
 * @returns The number of users who have signed up with the given user's referral code.
 */
export async function getReferralCount(userId: string): Promise<number> {
  if (!userId) {
    return 0;
  }

  try {
    const usersRef = adminDb.collection('users');
    const snapshot = await usersRef.where('referredBy', '==', userId).count().get();
    return snapshot.data().count;
  } catch (error) {
    console.error(`Error fetching referral count for user ${userId}:`, error);
    return 0; // Return 0 in case of an error
  }
}
