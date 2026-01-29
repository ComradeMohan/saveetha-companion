
'use client';

import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';

const WELCOME_TOAST_KEY = 'saveetha-companion-welcome-toast-shown';
const GLOBAL_MESSAGE_KEY = 'saveetha-companion-global-message-timestamp';

interface GlobalMessage {
    message: string;
    isEnabled: boolean;
    updatedAt: string;
}

export default function GlobalToastManager() {
    const { toast } = useToast();
    const { user, loading } = useAuth();

    useEffect(() => {
        // --- Welcome Toast for first-time visitors ---
        if (!loading && !user) { // Only show to logged-out users
            const welcomeToastShown = localStorage.getItem(WELCOME_TOAST_KEY);
            if (!welcomeToastShown) {
                const timer = setTimeout(() => {
                    toast({
                        title: "🎉 Welcome!",
                        description: "You've found the ultimate toolkit for students. Sign up to unlock all features.",
                    });
                    localStorage.setItem(WELCOME_TOAST_KEY, 'true');
                }, 4000); // Delay to not overwhelm the user immediately
                
                return () => clearTimeout(timer);
            }
        }
    }, [toast, user, loading]);

    useEffect(() => {
        // --- Global Announcement Toast ---
        const docRef = doc(db, 'site_config', 'global_message');

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data() as GlobalMessage;
                if (data.isEnabled && data.message) {
                    const lastSeenTimestamp = localStorage.getItem(GLOBAL_MESSAGE_KEY);
                    if (data.updatedAt !== lastSeenTimestamp) {
                        toast({
                            title: "Announcement",
                            description: data.message,
                        });
                        localStorage.setItem(GLOBAL_MESSAGE_KEY, data.updatedAt);
                    }
                }
            }
        }, (error) => {
            console.error("Error fetching global message:", error);
        });

        return () => unsubscribe();
    }, [toast]);

    return null; // This component does not render anything
}
