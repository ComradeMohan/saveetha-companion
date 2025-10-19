'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, messaging } from '@/lib/firebase';
import { getToken } from 'firebase/messaging';

export default function NotificationHandler() {
  console.log('NotificationHandler mounted');
  const { user, loading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const setupFCM = async () => {
      if (
        typeof window === 'undefined' ||
        loading ||
        !user ||
        !messaging ||
        !process.env.NEXT_PUBLIC_FCM_VAPID_KEY
      ) {
        return;
      }

      try {
        // Register the service worker explicitly
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
console.log('Service Worker registered with scope:', registration.scope);

if (registration.installing) {
  console.log('Service worker installing');
} else if (registration.waiting) {
  console.log('Service worker installed');
} else if (registration.active) {
  console.log('Service worker active');
}

        if (Notification.permission === 'default') {
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') {
            console.log('Notification permission was not granted.');
            toast({
              title: "Notifications Disabled",
              description: "You won't receive push notifications for important updates.",
              variant: "default"
            });
            return;
          }
        }

        if (Notification.permission === 'granted') {
          // Pass the registration as option to getToken()
          const fcmToken = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FCM_VAPID_KEY,
            serviceWorkerRegistration: registration
          });

          if (fcmToken) {
            console.log('FCM Token:', fcmToken);
            const tokenRef = doc(db, 'users', user.uid, 'fcmTokens', fcmToken);
            await setDoc(tokenRef, { createdAt: serverTimestamp() }, { merge: true });

            const tokenSentKey = `fcm_token_sent_${fcmToken.slice(-10)}`;
            if (!sessionStorage.getItem(tokenSentKey)) {
              toast({
                title: "Notifications Enabled!",
                description: "Your device is now registered for push notifications.",
              });

              new Notification('Notifications Enabled', {
                body: 'You will now receive updates from Saveetha Companion.',
              });

              sessionStorage.setItem(tokenSentKey, 'true');
            }
          }
        }
      } catch (error) {
        console.error('An error occurred while setting up notifications: ', error);
        toast({
          title: "Notification Setup Error",
          description: "Could not set up push notifications. Please check your browser settings and try again.",
          variant: "destructive"
        });
      }
    };

    setupFCM();
  }, [user, loading, toast]);

  // This component renders nothing visible
  return null;
}
