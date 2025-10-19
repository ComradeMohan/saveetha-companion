
'use client';

import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationPermissionBannerProps {
    show: boolean;
    onEnable: () => void;
    onDismiss: () => void;
}

// This component is no longer used, as the permission is requested automatically.
// Kept for reference or future use. It is not currently rendered.
export default function NotificationPermissionBanner({ show, onEnable, onDismiss }: NotificationPermissionBannerProps) {
    if (!show) {
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
                        <Button size="sm" onClick={onEnable}>Enable Notifications</Button>
                        <Button size="sm" variant="ghost" onClick={onDismiss}>Dismiss</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
