
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Bell, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'notificationPermissionDismissed';

export default function NotificationPermissionBanner() {
    const { user, setupFCM } = useAuth();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (user && 'Notification' in window) {
            const permission = Notification.permission;
            const dismissed = localStorage.getItem(STORAGE_KEY);
            if (permission === 'default' && !dismissed) {
                // Delay showing the banner slightly
                const timer = setTimeout(() => {
                    setIsVisible(true);
                }, 5000); 
                return () => clearTimeout(timer);
            }
        }
    }, [user]);

    const handleEnable = async () => {
        await setupFCM();
        setIsVisible(false); // Hide after interaction
    };

    const handleDismiss = () => {
        localStorage.setItem(STORAGE_KEY, 'true');
        setIsVisible(false);
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 md:bottom-auto md:top-24">
            <div className="container mx-auto">
                <div className="flex items-center justify-between gap-4 rounded-lg bg-secondary p-3 text-secondary-foreground shadow-lg">
                    <div className="flex items-center gap-3">
                        <Bell className="h-5 w-5 flex-shrink-0" />
                        <p className="text-sm font-medium">
                            Enable push notifications to get important updates instantly.
                        </p>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2">
                        <Button size="sm" onClick={handleEnable}>Enable</Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleDismiss}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
