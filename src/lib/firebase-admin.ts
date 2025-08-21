
import admin from 'firebase-admin';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let adminDb: admin.firestore.Firestore;

// Check if the required environment variables are set
const hasRequiredEnvVars = 
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY;

if (hasRequiredEnvVars) {
    if (!getApps().length) {
        try {
            const serviceAccount = {
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
            };

            initializeApp({
                credential: cert(serviceAccount),
            });
            console.log('Firebase Admin SDK initialized successfully.');
        } catch (error: any) {
            console.error('Firebase Admin SDK initialization error:', error.message);
            // This will prevent the app from starting if the admin SDK fails to initialize
            throw new Error('Firebase Admin SDK could not be initialized. Check server logs and environment variables.');
        }
    }
    adminDb = getFirestore(getApps()[0]);
} else {
    console.warn(
      'Firebase Admin environment variables are not set. Skipping Admin SDK initialization. Server-side actions requiring admin privileges will fail.'
    );
    // Assign a dummy object to prevent crashes on import, though operations will fail.
    adminDb = {} as admin.firestore.Firestore;
}


// Export the initialized admin DB for use in server actions
export { adminDb };
