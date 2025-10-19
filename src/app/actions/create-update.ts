
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { getMessaging } from 'firebase-admin/messaging';
import { z } from 'zod';

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
            link: link || null,
            createdAt: adminDb.FieldValue.serverTimestamp(),
        });
        
        // 2. Send Push Notifications
        const usersSnapshot = await adminDb.collection('users').get();
        const fcmTokens: string[] = [];
        
        for (const userDoc of usersSnapshot.docs) {
            const tokensCollection = await userDoc.ref.collection('fcmTokens').get();
            if (!tokensCollection.empty) {
                tokensCollection.forEach(tokenDoc => {
                    fcmTokens.push(tokenDoc.id);
                });
            }
        }
        
        if (fcmTokens.length > 0) {
            const message = {
                notification: {
                    title: title,
                    body: description,
                },
                webpush: {
                    fcmOptions: {
                      link: link || 'https://saveetha-companion.web.app/updates' // Fallback to updates page
                    }
                },
                tokens: fcmTokens,
            };

            const response = await getMessaging().sendEachForMulticast(message);
            console.log(`${response.successCount} messages were sent successfully`);
        }
        
        return { 
            type: 'success', 
            message: `Update posted and notifications sent to ${fcmTokens.length} devices.`
        };

    } catch (error: any) {
        console.error('Error creating update or sending notification:', error);
        return { type: 'error', message: 'An unexpected error occurred while processing the update.' };
    }
}
