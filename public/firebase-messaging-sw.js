// This file MUST be in the /public folder

// We need to import the Firebase apps scripts
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

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

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging(app);

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/favicon.ico',
    // Add custom data to the notification
    data: {
      url: payload.data.url || '/' // URL to open on click
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});


// Handle notification click event
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked: ', event.notification);
    event.notification.close();

    const urlToOpen = event.notification.data.url || '/';

    event.waitUntil(
        clients.matchAll({
            type: "window",
            includeUncontrolled: true
        }).then((clientList) => {
            // If a window for this origin is already open, focus it.
            for (const client of clientList) {
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            // Otherwise, open a new window.
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
