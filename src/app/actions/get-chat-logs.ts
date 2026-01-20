
'use server';

import { adminDb } from '@/lib/firebase-admin';

export interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
}

export interface ChatLog {
  id: string;
  userName: string;
  userId: string;
  createdAt: any;
  messages: ChatMessage[];
  source: 'popover' | 'page';
}

export async function getChatLogs(): Promise<ChatLog[]> {
  try {
    const snapshot = await adminDb.collection('chat-logs').orderBy('createdAt', 'desc').get();
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            userName: data.userName,
            userId: data.userId,
            createdAt: data.createdAt,
            messages: data.messages,
            source: data.source,
        }
    });
  } catch (error) {
    console.error('Error fetching chat logs:', error);
    return [];
  }
}
