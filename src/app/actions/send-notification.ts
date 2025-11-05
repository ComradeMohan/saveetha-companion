
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { getMessaging } from 'firebase-admin/messaging';
import { z } from 'zod';
import { FieldValue } from 'firebase-admin/firestore';
import { getAllUsers, getAllFcmTokens } from './get-users';

const notificationSchema = z.object({
    userIds: z.string().optional(),
    sendToAll: z.string().optional(),
    batchYear: z.string().optional(),
    title: z.string().min(1, { message: 'Title is required.' }),
    message: z.string().min(1, { message: 'Message is required.' }),
    link: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
});

export async function sendNotification(prevState: any, formData: FormData) {
    const validatedFields = notificationSchema.safeParse({
        userIds: formData.get('userIds'),
        sendToAll: formData.get('sendToAll'),
        batchYear: formData.get('batchYear'),
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
    
    const { userIds, sendToAll, batchYear, title, message, link } = validatedFields.data;
    const isSendingToAll = sendToAll === 'on';

    if (!isSendingToAll && (!batchYear || batchYear.length < 4) && (!userIds || userIds.trim() === '')) {
        return { type: 'error', message: 'Please select at least one recipient, a valid batch, or choose "Send to All".' };
    }

    try {
        let targetUserIds: string[] = [];

        if (isSendingToAll) {
            const allUsers = await getAllUsers();
            targetUserIds = allUsers.map(u => u.id);
        } else if (batchYear && batchYear.length >= 4) {
            const allUsers = await getAllUsers();
            const yearCode = batchYear.slice(-2);
            targetUserIds = allUsers
                .filter(u => u.regNo && u.regNo.substring(2, 4) === yearCode)
                .map(u => u.id);
        } else if (userIds) {
            targetUserIds = userIds.split(',').filter(id => id.trim() !== '');
        }

        if (targetUserIds.length === 0) {
             return { type: 'error', message: 'No recipients found for the selected criteria.' };
        }

        const timestamp = FieldValue.serverTimestamp();
        const batch = adminDb.batch();

        // 1. Add to in-app notification bell for all users
        targetUserIds.forEach(userId => {
            const notificationRef = adminDb.collection('user_notifications').doc(userId).collection('notifications').doc();
            batch.set(notificationRef, {
                title: title,
                message: message,
                link: link || null,
                type: 'default',
                read: false,
                createdAt: timestamp,
            });
        });
        await batch.commit();

        // 2. Efficiently get all FCM tokens
        const allFcmTokens = await getAllFcmTokens(targetUserIds);

        let totalPushSuccess = 0;
        let totalPushFailure = 0;

        // 3. Send push notifications in chunks of 500 (FCM limit)
        if (allFcmTokens.length > 0) {
            const tokenChunks: string[][] = [];
            for (let i = 0; i < allFcmTokens.length; i += 500) {
                tokenChunks.push(allFcmTokens.slice(i, i + 500));
            }

            for (const chunk of tokenChunks) {
                 const fcmMessage = {
                    notification: { 
                        title, 
                        body: message,
                    },
                     webpush: {
                        fcmOptions: {
                          link: link || 'https://saveethahub.tech/updates'
                        }
                    },
                    tokens: chunk,
                };
                const response = await getMessaging().sendEachForMulticast(fcmMessage);
                totalPushSuccess += response.successCount;
                totalPushFailure += response.failureCount;
            }
        }
        
        let successMessage = `In-app notification sent to ${targetUserIds.length} user(s).`;
        if (totalPushSuccess > 0 || totalPushFailure > 0) {
            successMessage += ` Push: ${totalPushSuccess} sent, ${totalPushFailure} failed.`;
        }
        
        return { 
            type: 'success', 
            message: successMessage,
        };
        
    } catch (error: any) {
        console.error('Error sending notification:', error);
        return { type: 'error', message: 'An unexpected error occurred during notification dispatch.' };
    }
}
