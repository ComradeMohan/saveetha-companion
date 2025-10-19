
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, messaging } from '@/lib/firebase';
import { getToken } from 'firebase/messaging';

export default function NotificationHandler() {
  const { user, loading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const setupFCM = async () => {
      // Ensure this only runs on the client side, after initial auth check, and if user is logged in
      if (typeof window === 'undefined' || loading || !user || !messaging || !process.env.NEXT_PUBLIC_FCM_VAPID_KEY) {
        return;
      }
      
      // Request permission if it's in the default state
      if (Notification.permission === 'default') {
        try {
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') {
            console.log('Notification permission denied.');
            return;
          }
        } catch (error) {
          console.error('Error requesting notification permission.', error);
          return;
        }
      }

      // If permission is granted, get the token and save it
      if (Notification.permission === 'granted') {
        try {
          const fcmToken = await getToken(messaging, { vapidKey: process.env.NEXT_PUBLIC_FCM_VAPID_KEY });
          if (fcmToken) {
            const tokenRef = doc(db, 'users', user.uid, 'fcmTokens', fcmToken);
            await setDoc(tokenRef, { createdAt: serverTimestamp() }, { merge: true });
            
            // Show toast and send test notification
            toast({
              title: "Notifications Enabled!",
              description: `Your device is now registered for push notifications. Token: ${fcmToken.substring(0, 20)}...`,
            });
            
            new Notification('Notifications Enabled', {
              body: 'You will now receive updates from Saveetha Companion.',
              icon: '/icons/icon-192x192.png',
            });

          }
        } catch (error) {
          console.error('An error occurred while retrieving token. ', error);
          toast({
            title: "Notification Error",
            description: "Could not set up push notifications. Please ensure your browser is supported and try again.",
            variant: "destructive"
          });
        }
      }
    };
    
    setupFCM();

  }, [user, loading, toast]);

  // This component doesn't render anything to the DOM
  return null;
}
