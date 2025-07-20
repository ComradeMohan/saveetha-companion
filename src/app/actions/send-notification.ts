
'use server';

import { adminDb, adminMessaging } from '@/lib/firebase-admin';
import { z } from 'zod';

const notificationSchema = z.object({
    title: z.string().min(1, { message: 'Title is required.' }),
    description: z.string().min(1, { message: 'Description is required.' }),
});

export async function sendNotification(prevState: any, formData: FormData) {
    const validatedFields = notificationSchema.safeParse({
        title: formData.get('title'),
        description: formData.get('description'),
    });

    if (!validatedFields.success) {
        return {
            type: 'error',
            message: 'Validation failed.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { title, description } = validatedFields.data;

    try {
        // 1. Save the notification to the 'notifications' collection
        const notificationRef = await adminDb.collection('notifications').add({
            title,
            description,
            createdAt: new Date().toISOString(),
        });
        console.log('Notification saved with ID: ', notificationRef.id);

        // 2. Send the push notification
        const usersSnapshot = await adminDb.collection('users').get();
        if (usersSnapshot.empty) {
            return { type: 'info', message: 'No users to send notifications to.' };
        }

        const tokens: string[] = [];
        usersSnapshot.forEach(doc => {
            const userData = doc.data();
            if (userData.fcmTokens && Array.isArray(userData.fcmTokens)) {
                tokens.push(...userData.fcmTokens);
            }
        });

        const uniqueTokens = [...new Set(tokens)];

        if (uniqueTokens.length === 0) {
            return { type: 'info', message: 'No users have enabled notifications.' };
        }
        
        console.log(`Sending notification to ${uniqueTokens.length} tokens.`);

        const message = {
            notification: {
                title,
                body: description,
            },
            tokens: uniqueTokens,
            android: {
                notification: {
                    icon: '/favicon.ico',
                    color: '#8A2BE2',
                },
            },
            webpush: {
                notification: {
                    icon: '/favicon.ico',
                },
                fcm_options: {
                    link: '/notifications' // Open the new notifications page
                }
            }
        };

        const response = await adminMessaging.sendEachForMulticast(message);
        console.log('Successfully sent message:', response);
        
        const successCount = response.successCount;
        const failureCount = response.failureCount;

        return { 
            type: 'success', 
            message: `Notification sent! ${successCount} successful, ${failureCount} failed.` 
        };

    } catch (error: any) {
        console.error('Error sending notification:', error);
        return { type: 'error', message: 'An unexpected error occurred while sending the notification.' };
    }
}
