
import { config } from 'dotenv';
config(); // Load environment variables from .env file

import admin from 'firebase-admin';
import { getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore, FieldValue } from 'firebase-admin/firestore';

let adminApp: App;
let adminDb: Firestore;

if (!getApps().length) {
    const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };

    try {
        adminApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount as any),
        });
        adminDb = getFirestore(adminApp);
        console.log('Firebase Admin SDK initialized successfully.');
    } catch (error: any) {
        console.error('Firebase Admin SDK initialization error:', error.message);
        // This will prevent the app from starting if the admin SDK fails to initialize
        throw new Error('Firebase Admin SDK could not be initialized. Check server logs and environment variables.');
    }
} else {
    adminApp = getApps()[0];
    adminDb = getFirestore(adminApp);
}

// Export the initialized admin DB and FieldValue for use in server actions
export { adminDb, FieldValue };
