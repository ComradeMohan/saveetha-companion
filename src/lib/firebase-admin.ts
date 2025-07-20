
import admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

let app;

if (!admin.apps.length) {
  try {
    const serviceAccountPath = path.resolve(process.cwd(), 'serviceAccountKey.json');
    
    if (!fs.existsSync(serviceAccountPath)) {
      throw new Error('serviceAccountKey.json not found in the project root. Please download it from your Firebase project settings and place it there.');
    }

    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin SDK initialized successfully from serviceAccountKey.json.');

  } catch (error: any) {
    console.error('Firebase Admin SDK initialization error:', error.message);
    throw new Error(`Firebase Admin SDK failed to initialize: ${error.message}`);
  }
} else {
    app = admin.app();
}

const adminDb = admin.firestore();
const adminMessaging = admin.messaging();

export { adminDb, adminMessaging };
