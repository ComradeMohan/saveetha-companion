
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { getMessaging } from 'firebase-admin/messaging';
import { z } from 'zod';
import { FieldValue } from 'firebase-admin/firestore'; // Import the correct FieldValue

const notificationSchema = z.object({
    email: z.string().email({ message: 'A valid email address is required.' }),
    title: z.string().min(1, { message: 'Title is required.' }),
    message: z.string().min(1, { message: 'Message is required.' }),
});

export async function sendNotification(prevState: any, formData: FormData) {
    const validatedFields = notificationSchema.safeParse({
        email: formData.get('email'),
        title: formData.get('title'),
        message: formData.get('message'),
    });

    if (!validatedFields.success) {
        return {
            type: 'error',
            message: 'Validation failed.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const { email, title, message } = validatedFields.data;

    try {
        const usersRef = adminDb.collection('users');
        const userQuery = await usersRef.where('email', '==', email).limit(1).get();

        if (userQuery.empty) {
            return { type: 'error', message: `User with email '${email}' not found.` };
        }
        
        const userDoc = userQuery.docs[0];
        const userId = userDoc.id;
        const timestamp = FieldValue.serverTimestamp(); // Use the correct Admin SDK timestamp

        // 1. Add notification to the user's in-app notification bell
        const notificationRef = adminDb.collection('user_notifications').doc(userId).collection('notifications').doc();
        await notificationRef.set({
            title: title,
            message: message,
            type: 'default',
            read: false,
            createdAt: timestamp,
        });

        // 2. Send FCM Push Notification if tokens exist
        const tokensSnapshot = await userDoc.ref.collection('fcmTokens').get();
        const fcmTokens: string[] = tokensSnapshot.docs.map(doc => doc.id);

        let pushMessage = "In-app notification sent.";

        if (fcmTokens.length > 0) {
             const fcmMessage = {
                notification: { title, body: message },
                tokens: fcmTokens,
            };
            const response = await getMessaging().sendEachForMulticast(fcmMessage);
            pushMessage += ` ${response.successCount} push notification(s) sent.`;
            
            if (response.failureCount > 0) {
                 pushMessage += ` ${response.failureCount} failed.`
            }
        } else {
            pushMessage += " No push notification sent (no device tokens found).";
        }
        
        return { 
            type: 'success', 
            message: pushMessage,
        };
        
    } catch (error: any) {
        console.error('Error sending notification:', error);
        return { type: 'error', message: 'An unexpected error occurred.' };
    }
}
