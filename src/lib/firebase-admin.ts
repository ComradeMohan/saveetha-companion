import admin from 'firebase-admin';
import 'dotenv/config';

let app;

if (!admin.apps.length) {
  try {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };

    if (!serviceAccount.projectId || !serviceAccount.privateKey || !serviceAccount.clientEmail) {
      throw new Error('Firebase Admin SDK environment variables are not set. Please check your .env file.');
    }

    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as any),
    });
    console.log('Firebase Admin SDK initialized successfully from environment variables.');

  } catch (error: any)
   {
    console.error('Firebase Admin SDK initialization error:', error.message);
    // Avoid throwing an error that crashes the server if the SDK is not needed for all parts.
    // Instead, the services will fail if used without proper initialization.
  }
} else {
    app = admin.app();
}

const adminDb = admin.firestore();
// Messaging has been removed.
// const adminMessaging = admin.messaging();

export { adminDb };
