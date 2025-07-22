
'use client';

import { GraduationCap } from "lucide-react";

export default function LoadingAnimation() {
    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <GraduationCap className="h-12 w-12 text-primary animate-pulse" />
            <div className="flex items-center space-x-2">
                <span className="text-lg font-semibold tracking-wider text-muted-foreground animate-pulse" style={{ animationDelay: '0.2s' }}>
                    Saveetha Companion
                </span>
            </div>
        </div>
    );
}
