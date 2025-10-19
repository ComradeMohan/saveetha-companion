'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, messaging } from '@/lib/firebase';
import { getToken, onMessage } from 'firebase/messaging';

/**
 * A client-side component that handles Firebase Cloud Messaging (FCM)
 * setup and token management once permission has been granted.
 */
export default function NotificationHandler() {
  const { user, loading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const setupFCM = async () => {
      // Exit if not in a browser, user is not logged in, or Firebase messaging is not available.
      if (typeof window === 'undefined' || loading || !user || !messaging) {
        return;
      }
      
      // Only proceed if permission is already granted.
      if (Notification.permission === 'granted') {
        try {
          // Explicitly register the service worker.
          const swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

          const fcmToken = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FCM_VAPID_KEY,
            serviceWorkerRegistration: swRegistration,
          });

          if (fcmToken) {
            // Save the new token to Firestore.
            const tokenRef = doc(db, 'users', user.uid, 'fcmTokens', fcmToken);
            await setDoc(tokenRef, { createdAt: serverTimestamp() }, { merge: true });
          } else {
            console.warn('Could not get FCM token. User might need to grant permission again.');
          }
        } catch (error) {
          console.error('An error occurred while retrieving token. ', error);
          toast({
            title: "Could Not Get Notification Token",
            description: "There was an error setting up push notifications. Please try disabling and re-enabling them.",
            variant: "destructive"
          });
        }
      }
    };

    setupFCM();

    // Handle foreground messages
    if (messaging) {
        const unsubscribe = onMessage(messaging, (payload) => {
            console.log('Foreground message received. ', payload);
            toast({
                title: payload.notification?.title,
                description: payload.notification?.body,
            });
        });
        return () => unsubscribe();
    }

  }, [user, loading, toast]);

  // This component renders nothing visible.
  return null;
}
