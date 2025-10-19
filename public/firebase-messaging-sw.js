// This file must be in the public folder.

// Scripts for firebase and firebase messaging
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

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
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  
  // Customize the notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/favicon.ico", // Ensure you have a favicon.ico in your public folder
    data: {
      url: payload.fcmOptions.link || '/' // The URL to open when the notification is clicked
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click event
self.addEventListener('notificationclick', (event) => {
    event.notification.close(); // Close the notification

    const urlToOpen = event.notification.data.url;

    // This looks for an existing window and focuses it, otherwise opens a new one
    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then((clientList) => {
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});