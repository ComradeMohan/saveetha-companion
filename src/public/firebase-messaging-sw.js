
// This file must be in the public folder.

import { initializeApp } from 'firebase/app';
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBwjHDLTyuKHOqGTL-r5DfawStnNpOU57E",
  authDomain: "saveethacgpa.firebaseapp.com",
  projectId: "saveethacgpa",
  storageBucket: "saveethacgpa.appspot.com",
  messagingSenderId: "184883570512",
  appId: "1:184883570512:web:db8e7b5eefdb61f71c6e55",
  measurementId: "G-MFMFF0EKNW"
};


// Initialize the Firebase app in the service worker
// Note: this is a different initialization than in your app's code
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

onBackgroundMessage(messaging, (payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  if (!payload.notification) {
    return;
  }
  
  const notificationTitle = payload.notification.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification.body || '',
    icon: payload.notification.image || '/icons/icon-192x192.png' 
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
