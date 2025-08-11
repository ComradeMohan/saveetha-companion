
import { config } from 'dotenv';
config(); // Load environment variables from .env file

import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';
import { FieldValue } from 'firebase-admin/firestore';

const createServiceAccount = () => {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (e) {
      console.error('Error parsing FIREBASE_SERVICE_ACCOUNT:', e);
    }
  }

  // Fallback to individual variables if the single one isn't provided or fails to parse.
  return {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  };
};

const serviceAccount = createServiceAccount();

export const initializeAdminApp = async () => {
  if (getApps().length > 0) {
    return {
      adminDb: admin.firestore(),
      adminAuth: admin.auth(),
    };
  }

  try {
     admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as any),
    });
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error: any) {
    console.error('Firebase Admin SDK initialization error:', error.message);
    // Rethrow or handle as appropriate. For now, we'll let it fail loudly
    // so downstream consumers know there's a problem.
    throw new Error('Firebase Admin SDK could not be initialized. Check server logs.');
  }

  return {
    adminDb: admin.firestore(),
    adminAuth: admin.auth(),
  };
};

// Export FieldValue for use in server actions
export { FieldValue };
