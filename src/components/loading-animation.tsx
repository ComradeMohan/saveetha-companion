
'use client';

import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function LoadingAnimation() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Simulate loading progress
        const timer = setTimeout(() => {
            setProgress(p => Math.min(p + 1, 90));
        }, 50);

        return () => clearTimeout(timer);
    }, [progress]);

    const circumference = 2 * Math.PI * 45; // 2 * pi * radius

    return (
        <div className="flex flex-col items-center justify-center gap-4" aria-label="Loading">
            <div className="relative h-28 w-28">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        className="stroke-muted"
                        strokeWidth="5"
                        fill="transparent"
                    />
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        className="stroke-primary transition-all duration-300 ease-linear"
                        strokeWidth="5"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference - (progress / 100) * circumference}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <GraduationCap className="h-12 w-12 text-primary" />
                </div>
            </div>
            <div className="flex flex-col items-center space-y-2">
                <span className="text-lg font-semibold tracking-wider text-muted-foreground">
                    Loading... {progress}%
                </span>
                <span className="text-sm text-muted-foreground/80">
                    Preparing your dashboard
                </span>
            </div>
        </div>
    );
}
