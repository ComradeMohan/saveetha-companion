
'use client';

import { useEffect } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app, db } from '@/lib/firebase';
import { useToast } from './use-toast';
import { useAuth } from './use-auth';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

const useFcm = () => {
    const { toast } = useToast();
    const { user } = useAuth();

    useEffect(() => {
        if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
            return;
        }

        const messaging = getMessaging(app);

        const requestPermissionAndToken = async () => {
            if (!user) return;
            
            try {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    console.log('Notification permission granted.');
                    const currentToken = await getToken(messaging, { vapidKey: 'BKmwJIg3BZJlJUg9QszIe6SQUeZn6mGyZe0qkQcjX65JYoIC3MUuIGnfWa_3DPTBOk6YJjXK20UX3cdWrfNt-94' });
                    if (currentToken) {
                        console.log('FCM Token:', currentToken);
                        // Save the token to the user's document in Firestore
                        const userDocRef = doc(db, 'users', user.uid);
                        await updateDoc(userDocRef, {
                            fcmTokens: arrayUnion(currentToken)
                        });
                    } else {
                        console.log('No registration token available. Request permission to generate one.');
                    }
                } else {
                    console.log('Unable to get permission to notify.');
                }
            } catch (error) {
                console.error('An error occurred while retrieving token. ', error);
            }
        };

        requestPermissionAndToken();

        const unsubscribe = onMessage(messaging, (payload) => {
            console.log('Message received. ', payload);
            toast({
                title: payload.notification?.title || 'New Notification',
                description: payload.notification?.body,
            });
        });

        return () => {
            unsubscribe();
        };
    }, [user, toast]);

    return null; 
};

export default useFcm;
