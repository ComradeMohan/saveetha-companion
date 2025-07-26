
'use client';

import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoadingAnimation() {
    return (
        <div className="flex flex-col items-center justify-center gap-4" aria-label="Loading">
            <div className="relative h-16 w-16">
                 <GraduationCap className="h-16 w-16 text-primary animate-pulse" />
            </div>
            <div className="flex flex-col items-center space-y-2">
                <span className="text-lg font-semibold tracking-wider text-muted-foreground">
                    Saveetha Companion
                </span>
                 <div className="w-32 h-1 bg-muted rounded-full overflow-hidden">
                    <div className="w-full h-full bg-primary animate-loading-line rounded-full"></div>
                </div>
            </div>
             <style jsx>{`
                @keyframes loading-line {
                    0% {
                        transform: translateX(-100%);
                    }
                    50% {
                        transform: translateX(100%);
                    }
                    100% {
                         transform: translateX(-100%);
                    }
                }
                .animate-loading-line {
                    animation: loading-line 1.5s infinite ease-in-out;
                }
            `}</style>
        </div>
    );
}
