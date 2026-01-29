'use server';

import { adminDb } from '@/lib/firebase-admin';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';

export interface RecruitmentSubmission {
  id: string;
  name: string;
  userEmail: string;
  personalEmail: string;
  regNo: string;
  batch: string;
  submittedAt: any;
}

export async function getRecruitmentSubmissions(): Promise<RecruitmentSubmission[]> {
  try {
    const q = query(collection(adminDb, 'recruitment-submissions'), orderBy('submittedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const data: RecruitmentSubmission[] = [];
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() } as RecruitmentSubmission);
    });
    return data;
  } catch (error) {
    console.error('Error fetching recruitment submissions:', error);
    return [];
  }
}
