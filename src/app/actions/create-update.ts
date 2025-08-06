'use server';

import { adminDb } from '@/lib/firebase-admin';
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
        // Save the update to Firestore
        await adminDb.collection('updates').add({
            title,
            description,
            link: link || null, // Store null if link is empty
            createdAt: FieldValue.serverTimestamp(),
        });
        
        return { 
            type: 'success', 
            message: `Update posted successfully!` 
        };

    } catch (error: any) {
        console.error('Error creating update:', error);
        return { type: 'error', message: 'An unexpected error occurred while creating the update.' };
    }
}
