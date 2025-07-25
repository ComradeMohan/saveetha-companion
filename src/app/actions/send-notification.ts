'use server';

// This file is no longer used since FCM has been removed,
// but is kept to prevent build errors from components that might still import it.
// The primary update logic is now in `create-update.ts`.

export async function sendNotification(prevState: any, formData: FormData) {
    console.warn("sendNotification is deprecated and should not be used.");
    return {
        type: 'info',
        message: 'This function is no longer active. Please use the Updates page.',
    };
}
