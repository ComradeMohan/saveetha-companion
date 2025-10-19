
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { getMessaging } from 'firebase-admin/messaging';
import { z } from 'zod';
import { FieldValue } from 'firebase-admin/firestore';
import { getAllUsers } from './get-users';

const notificationSchema = z.object({
    userIds: z.string().optional(),
    sendToAll: z.string().optional(),
    title: z.string().min(1, { message: 'Title is required.' }),
    message: z.string().min(1, { message: 'Message is required.' }),
    link: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
});

export async function sendNotification(prevState: any, formData: FormData) {
    const validatedFields = notificationSchema.safeParse({
        userIds: formData.get('userIds'),
        sendToAll: formData.get('sendToAll'),
        title: formData.get('title'),
        message: formData.get('message'),
        link: formData.get('link'),
    });

    if (!validatedFields.success) {
        return {
            type: 'error',
            message: 'Validation failed.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const { userIds, sendToAll, title, message, link } = validatedFields.data;
    const isSendingToAll = sendToAll === 'on';

    if (!isSendingToAll && (!userIds || userIds.trim() === '')) {
        return { type: 'error', message: 'Please select at least one recipient or choose "Send to All".' };
    }

    try {
        let targetUserIds: string[] = [];

        if (isSendingToAll) {
            const allUsers = await getAllUsers();
            targetUserIds = allUsers.map(u => u.id);
        } else {
            targetUserIds = userIds!.split(',').filter(id => id.trim() !== '');
        }

        if (targetUserIds.length === 0) {
             return { type: 'error', message: 'No recipients found.' };
        }

        const timestamp = FieldValue.serverTimestamp();
        let totalNotificationsSent = 0;
        let totalPushSuccess = 0;
        let totalPushFailure = 0;

        // Process in chunks to avoid overwhelming the system
        const chunkSize = 500;
        for (let i = 0; i < targetUserIds.length; i += chunkSize) {
            const chunk = targetUserIds.slice(i, i + chunkSize);
            const batch = adminDb.batch();
            const fcmTokensForChunk: string[] = [];

            const userDocs = await Promise.all(chunk.map(id => adminDb.collection('users').doc(id).get()));

            for (const userDoc of userDocs) {
                if (userDoc.exists) {
                    const userId = userDoc.id;

                    // 1. Add to in-app notification bell
                    const notificationRef = adminDb.collection('user_notifications').doc(userId).collection('notifications').doc();
                    batch.set(notificationRef, {
                        title: title,
                        message: message,
                        link: link || null,
                        type: 'default',
                        read: false,
                        createdAt: timestamp,
                    });
                    totalNotificationsSent++;

                    // 2. Gather FCM tokens for push notification
                    const tokensSnapshot = await userDoc.ref.collection('fcmTokens').get();
                    if (!tokensSnapshot.empty) {
                        fcmTokensForChunk.push(...tokensSnapshot.docs.map(doc => doc.id));
                    }
                }
            }

            // Commit in-app notifications for the chunk
            await batch.commit();

            // Send push notifications for the chunk
            if (fcmTokensForChunk.length > 0) {
                const fcmMessage = {
                    notification: { 
                        title, 
                        body: message,
                    },
                     webpush: {
                        fcmOptions: {
                          link: link || 'https://saveetha-companion.web.app/updates'
                        }
                    },
                    tokens: fcmTokensForChunk,
                };
                const response = await getMessaging().sendEachForMulticast(fcmMessage);
                totalPushSuccess += response.successCount;
                totalPushFailure += response.failureCount;
            }
        }

        let successMessage = `In-app notification sent to ${totalNotificationsSent} user(s).`;
        if (totalPushSuccess > 0) {
            successMessage += ` ${totalPushSuccess} push notification(s) sent.`;
        }
        if (totalPushFailure > 0) {
            successMessage += ` ${totalPushFailure} failed.`;
        }
        
        return { 
            type: 'success', 
            message: successMessage,
        };
        
    } catch (error: any) {
        console.error('Error sending notification:', error);
        return { type: 'error', message: 'An unexpected error occurred.' };
    }
}
