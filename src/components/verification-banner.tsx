
'use client';

import { useAuth } from "@/hooks/use-auth";
import { AlertTriangle } from "lucide-react";

export default function VerificationBanner() {
    const { user, loading } = useAuth();

    if (loading || !user || user.emailVerified) {
        return null;
    }

    return (
        <div className="sticky top-0 z-50 w-full overflow-hidden bg-yellow-400 text-yellow-900 shadow-md">
            <div className="flex items-center whitespace-nowrap animate-scroll-text">
                <div className="flex-shrink-0 flex items-center gap-2 px-6 py-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-semibold">Please verify your email.</span>
                    <span className="text-sm">Check your inbox (and spam folder) for a verification link from comrademohan.</span>
                </div>
                <div className="flex-shrink-0 flex items-center gap-2 px-6 py-2" aria-hidden="true">
                     <AlertTriangle className="h-4 w-4" />
                    <span className="font-semibold">Please verify your email.</span>
                    <span className="text-sm">Check your inbox (and spam folder) for a verification link from comrademohan.</span>
                </div>
            </div>
        </div>
    );
}
