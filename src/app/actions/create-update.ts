
'use server';

import { adminDb, adminMessaging } from '@/lib/firebase-admin';
import { z } from 'zod';
import { FieldValue } from 'firebase-admin/firestore';

const updateSchema = z.object({
    title: z.string().min(1, { message: 'Title is required.' }),
    description: z.string().min(1, { message: 'Description is required.' }),
    link: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
});

export async function createUpdate(prevState: any, formData: FormData) {
    const validatedFields = updateSchema.safeParse({
        title: formData.get('title'),
        description: formData.get('description'),
        link: formData.get('link'),
    });

    if (!validatedFields.success) {
        return {
            type: 'error',
            message: 'Validation failed.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { title, description, link } = validatedFields.data;

    try {
        // 1. Save the update to Firestore
        await adminDb.collection('updates').add({
            title,
            description,
            link: link || null, // Store null if link is empty
            createdAt: FieldValue.serverTimestamp(),
        });

        // 2. Send the push notification
        const usersSnapshot = await adminDb.collection('users').get();
        if (usersSnapshot.empty) {
            return { type: 'success', message: 'Update posted, but no users to send notifications to.' };
        }

        const tokens: string[] = [];
        usersSnapshot.forEach(doc => {
            const userData = doc.data();
            // Ensure fcmTokens exists and is an array before spreading
            if (userData.fcmTokens && Array.isArray(userData.fcmTokens)) {
                tokens.push(...userData.fcmTokens);
            }
        });

        const uniqueTokens = [...new Set(tokens)];

        if (uniqueTokens.length === 0) {
            return { type: 'success', message: 'Update posted, but no users have enabled notifications.' };
        }
        
        console.log(`Sending update notification to ${uniqueTokens.length} tokens.`);

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
                    link: '/updates' // Open the updates page
                }
            }
        };

        const response = await adminMessaging.sendEachForMulticast(message);
        const successCount = response.successCount;
        const failureCount = response.failureCount;

        return { 
            type: 'success', 
            message: `Update posted! Notification sent: ${successCount} successful, ${failureCount} failed.` 
        };

    } catch (error: any) {
        console.error('Error creating update:', error);
        return { type: 'error', message: 'An unexpected error occurred while creating the update.' };
    }
}
