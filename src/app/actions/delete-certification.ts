
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const deleteSchema = z.object({
    id: z.string().min(1, { message: 'Certification ID is required.' }),
});

export async function deleteCertification(certificationId: string) {
    const validatedFields = deleteSchema.safeParse({ id: certificationId });

    if (!validatedFields.success) {
        return {
            type: 'error',
            message: 'Invalid Certification ID.',
        };
    }

    const { id } = validatedFields.data;

    try {
         if (!adminDb) {
             throw new Error('Firebase Admin not initialized. Check server logs.');
        }
        await adminDb.collection('certifications').doc(id).delete();
        
        revalidatePath('/admin/certifications');
        revalidatePath('/certifications');
        
        return { 
            type: 'success', 
            message: 'Certification deleted successfully.'
        };

    } catch (error: any) {
        console.error('Error deleting certification:', error);
        return { type: 'error', message: 'An unexpected error occurred while deleting the certification.' };
    }
}
