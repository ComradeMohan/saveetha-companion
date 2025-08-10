
import { config } from 'dotenv';
// Running config here ensures environment variables are loaded for all server-side processes.
config();

import admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

let app;

if (!admin.apps.length) {
  try {
    let serviceAccount;
    // Prefer using a single service account JSON from env vars for robustness.
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else {
        // Fallback to individual variables if the single one isn't provided.
        serviceAccount = {
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        };
    }

    if (!serviceAccount.projectId || !serviceAccount.privateKey || !serviceAccount.clientEmail) {
      throw new Error('Firebase Admin SDK service account credentials are not set. Please check your .env file for FIREBASE_SERVICE_ACCOUNT or individual keys.');
    }

    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as any),
    });
    console.log('Firebase Admin SDK initialized successfully.');

  } catch (error: any)
   {
    console.error('Firebase Admin SDK initialization error:', error.message);
  }
} else {
    app = admin.app();
}

const adminDb = app ? admin.firestore() : null;
const adminAuth = app ? admin.auth() : null;

// Add a check to ensure db is not null before exporting
if (!adminDb) {
    // This will prevent the app from starting if admin SDK fails, which is safer
    // for operations that absolutely depend on it.
    throw new Error("Firestore Admin DB could not be initialized. Server actions will fail.");
}


export { adminDb, adminAuth, FieldValue };
