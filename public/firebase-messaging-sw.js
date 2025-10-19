
// This service worker file must be in the public directory.

// Import and initialize the Firebase SDK
import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

const firebaseConfig = {
  apiKey: "AIzaSyBwjHDLTyuKHOqGTL-r5DfawStnNpOU57E",
  authDomain: "saveethacgpa.firebaseapp.com",
  projectId: "saveethacgpa",
  storageBucket: "saveethacgpa.appspot.com",
  messagingSenderId: "184883570512",
  appId: "1:184883570512:web:db8e7b5eefdb61f71c6e55",
  measurementId: "G-MFMFF0EKNW"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

onBackgroundMessage(messaging, (payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icons/icon-192x192.png' // Make sure you have this icon
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
