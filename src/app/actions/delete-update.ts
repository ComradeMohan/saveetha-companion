
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const deleteSchema = z.object({
    id: z.string().min(1, { message: 'Update ID is required.' }),
});

export async function deleteUpdate(updateId: string) {
    const validatedFields = deleteSchema.safeParse({ id: updateId });

    if (!validatedFields.success) {
        return {
            type: 'error',
            message: 'Invalid Update ID.',
        };
    }

    const { id } = validatedFields.data;

    try {
        await adminDb.collection('updates').doc(id).delete();
        
        revalidatePath('/admin/updates'); // Revalidate the admin page
        revalidatePath('/updates'); // Revalidate the public updates page
        
        return { 
            type: 'success', 
            message: 'Update deleted successfully.'
        };

    } catch (error: any) {
        console.error('Error deleting update:', error);
        return { type: 'error', message: 'An unexpected error occurred while deleting the update.' };
    }
}
