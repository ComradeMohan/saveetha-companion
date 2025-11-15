
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

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
        const timestamp = adminDb.FieldValue.serverTimestamp();

        // 1. Save the update to the public 'updates' collection
        await adminDb.collection('updates').add({
            title,
            description,
            link: link || null,
            createdAt: timestamp,
        });
        
        revalidatePath('/admin/updates');
        revalidatePath('/updates');

        // 2. Distribute the notification to all users' notification subcollections
        const usersSnapshot = await adminDb.collection('users').get();
        if (!usersSnapshot.empty) {
            const batch = adminDb.batch();
            usersSnapshot.docs.forEach(userDoc => {
                const notificationRef = adminDb.collection('user_notifications').doc(userDoc.id).collection('notifications').doc();
                batch.set(notificationRef, {
                    message: description,
                    title: title, // Optional: might be useful later
                    type: 'announcement',
                    read: false,
                    createdAt: timestamp,
                });
            });
            await batch.commit();
        }

        let notificationMessage = `${usersSnapshot.size} users notified in-app.`;

         return { 
            type: 'success', 
            message: notificationMessage
        };
        
    } catch (error: any) {
        console.error('Error creating update or sending notification:', error);
        return { type: 'error', message: 'An unexpected error occurred while processing the update.' };
    }
}
