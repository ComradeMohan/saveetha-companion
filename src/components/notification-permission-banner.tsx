
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Bell, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NotificationPermissionBanner() {
    const { user, loading, setupFCM } = useAuth();
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        if (!loading && user && typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission === 'default') {
                // Only show banner if permission is 'default' (not granted or denied)
                const bannerDismissed = localStorage.getItem('notificationBannerDismissed');
                if (!bannerDismissed) {
                    setShowBanner(true);
                }
            } else {
                setShowBanner(false);
            }
        } else {
            setShowBanner(false);
        }
    }, [user, loading]);

    const handleEnable = async () => {
        await setupFCM();
        setShowBanner(false); // Hide banner after interaction
    };

    const handleDismiss = () => {
        setShowBanner(false);
        localStorage.setItem('notificationBannerDismissed', 'true');
    };

    if (!showBanner) {
        return null;
    }

    return (
        <div className={cn(
            "fixed bottom-0 left-0 right-0 z-50 w-full p-4",
            "animate-in slide-in-from-bottom-5 duration-500"
        )}>
            <div className="container mx-auto">
                 <div className="bg-background/80 border border-border rounded-lg shadow-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                           <Bell className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-semibold">Enable Notifications</p>
                            <p className="text-sm text-muted-foreground">Stay up to date with important announcements.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Button size="sm" onClick={handleEnable}>Enable Notifications</Button>
                        <Button size="sm" variant="ghost" onClick={handleDismiss}>Dismiss</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
