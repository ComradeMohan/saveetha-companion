
'use client';

import { Rocket } from "lucide-react";

export default function FeatureAnnouncementBanner() {
    const announcement = "New Feature: The Course Enrollment auto-checker is now live! Get notified instantly.";

    return (
        <div className="relative z-40 w-full overflow-hidden bg-secondary text-secondary-foreground shadow-md">
            <div className="flex h-10 items-center">
                <div className="relative flex h-full items-center overflow-hidden">
                    <div className="animate-scroll-text flex whitespace-nowrap">
                        <div className="flex items-center gap-2 px-6 py-2">
                             <Rocket className="h-4 w-4 flex-shrink-0" />
                            <span className="font-semibold">{announcement}</span>
                        </div>
                        <div className="flex items-center gap-2 px-6 py-2" aria-hidden="true">
                             <Rocket className="h-4 w-4 flex-shrink-0" />
                            <span className="font-semibold">{announcement}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
