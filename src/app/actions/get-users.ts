
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

export async function getAllFcmTokens(userIds: string[] = []): Promise<string[]> {
    if (userIds.length === 0) {
        return [];
    }
    
    try {
        // Firestore 'in' queries are limited to 30 items per query.
        // We need to chunk the userIds array into groups of 30.
        const chunks: string[][] = [];
        for (let i = 0; i < userIds.length; i += 30) {
            chunks.push(userIds.slice(i, i + 30));
        }

        const allTokens: Set<string> = new Set();
        
        const chunkPromises = chunks.map(async (chunk) => {
            const usersSnapshot = await adminDb.collection('users').where('__name__', 'in', chunk).get();
            
            const tokenPromises = usersSnapshot.docs.map(userDoc => 
                userDoc.ref.collection('fcmTokens').get()
            );

            const tokenSnapshots = await Promise.all(tokenPromises);
            tokenSnapshots.forEach(tokenCollection => {
                if (!tokenCollection.empty) {
                    tokenCollection.forEach(tokenDoc => {
                        allTokens.add(tokenDoc.id);
                    });
                }
            });
        });
        
        await Promise.all(chunkPromises);

        return Array.from(allTokens);
    } catch (error) {
        console.error('Error fetching all FCM tokens:', error);
        return [];
    }
}
