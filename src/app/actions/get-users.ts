
'use server';

import { adminDb } from '@/lib/firebase-admin';

export interface BasicUser {
  id: string;
  name: string;
  email: string;
}

export async function getAllUsers(): Promise<BasicUser[]> {
  try {
    const usersSnapshot = await adminDb.collection('users').orderBy('name', 'asc').get();
    if (usersSnapshot.empty) {
      return [];
    }
    return usersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || 'Unnamed User',
        email: data.email,
      };
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
}
