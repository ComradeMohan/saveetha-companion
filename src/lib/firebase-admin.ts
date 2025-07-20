
import admin from 'firebase-admin';

let app;

if (!admin.apps.length) {
  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountJson) {
      throw new Error('Firebase service account key is not set in environment variables. Please ensure it is configured correctly.');
    }

    const serviceAccount = JSON.parse(serviceAccountJson);

    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error: any) {
    console.error('Firebase Admin SDK initialization error:', error.message);
    // Throwing the error here will prevent the app from trying to use a non-existent admin instance
    throw new Error(`Firebase Admin SDK failed to initialize: ${error.message}`);
  }
} else {
    app = admin.app();
}

const adminDb = admin.firestore();
const adminMessaging = admin.messaging();

export { adminDb, adminMessaging };
