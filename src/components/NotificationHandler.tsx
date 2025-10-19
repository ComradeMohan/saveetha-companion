
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
      
      try {
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
            const fcmToken = await getToken(messaging, { vapidKey: process.env.NEXT_PUBLIC_FCM_VAPID_KEY });
            
            if (fcmToken) {
                const tokenRef = doc(db, 'users', user.uid, 'fcmTokens', fcmToken);
                await setDoc(tokenRef, { createdAt: serverTimestamp() }, { merge: true });
                
                // Show a toast and send a test notification only once, perhaps by checking session storage
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

  // This component doesn't render anything to the DOM
  return null;
}
