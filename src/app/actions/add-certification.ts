
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const certificationSchema = z.object({
    title: z.string().min(1, { message: 'Title is required.' }),
    description: z.string().min(1, { message: 'Description is required.' }),
    provider: z.string().min(1, { message: 'Provider is required.' }),
    url: z.string().url({ message: "Please enter a valid URL." }),
});

export async function addCertification(prevState: any, formData: FormData) {
    const validatedFields = certificationSchema.safeParse({
        title: formData.get('title'),
        description: formData.get('description'),
        provider: formData.get('provider'),
        url: formData.get('url'),
    });

    if (!validatedFields.success) {
        return {
            type: 'error',
            message: 'Validation failed.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { title, description, url, provider } = validatedFields.data;

    try {
        if (!adminDb) {
             throw new Error('Firebase Admin not initialized. Check server logs.');
        }

        await adminDb.collection('certifications').add({
            title,
            description,
            url,
            provider,
            createdAt: adminDb.FieldValue.serverTimestamp(),
        });
        
        // Revalidate paths to ensure fresh data is shown
        revalidatePath('/admin/certifications');
        revalidatePath('/certifications');
        
        return { 
            type: 'success', 
            message: `Certification '${title}' added successfully!` 
        };

    } catch (error: any) {
        console.error('Error creating certification:', error);
        return { type: 'error', message: 'An unexpected error occurred while adding the certification.' };
    }
}
