
'use server';

import { adminDb } from '@/lib/firebase-admin';
import type { DocumentData, Query, QuerySnapshot } from 'firebase-admin/firestore';

export interface BasicUser {
  id: string;
  name: string;
  email: string;
  regNo?: string;
}

export async function getAllUsers(options: { includeFcmTokens?: boolean } = {}): Promise<BasicUser[]> {
  try {
    const usersSnapshot = await adminDb.collection('users').orderBy('name', 'asc').get();
    if (usersSnapshot.empty) {
      return [];
    }

    const users = usersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || 'Unnamed User',
        email: data.email,
        regNo: data.regNo,
      };
    });

    return users;
  } catch (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
}
