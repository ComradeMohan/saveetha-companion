// firebase-messaging-sw.js (to be placed in your public folder)

// Import Firebase scripts using importScripts
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

// Your Firebase config object (replace with your actual config)

const firebaseConfig = {
  apiKey: "AIzaSyBwjHDLTyuKHOqGTL-r5DfawStnNpOU57E",
  authDomain: "saveethacgpa.firebaseapp.com",
  projectId: "saveethacgpa",
  storageBucket: "saveethacgpa.appspot.com",
  messagingSenderId: "184883570512",
  appId: "1:184883570512:web:db8e7b5eefdb61f71c6e55",
  measurementId: "G-MFMFF0EKNW"
};


// Initialize Firebase app in service worker
firebase.initializeApp(firebaseConfig);

// Initialize messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
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
