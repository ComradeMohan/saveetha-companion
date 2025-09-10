
'use client';

import { useAuth } from "@/hooks/use-auth";
import { AlertTriangle } from "lucide-react";

export default function VerificationBanner() {
    const { profile, loading } = useAuth();

    if (loading || !profile || profile.isVerified) {
        return null;
    }

    return (
        <div className="sticky top-0 z-50 w-full overflow-hidden bg-yellow-400 text-yellow-900 shadow-md">
            <div className="flex items-center whitespace-nowrap animate-scroll-text">
                <div className="flex-shrink-0 flex items-center gap-2 px-6 py-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-semibold">Your account is pending approval.</span>
                    <span className="text-sm">An administrator will review your sign-up shortly. Please check back later.</span>
                </div>
                <div className="flex-shrink-0 flex items-center gap-2 px-6 py-2" aria-hidden="true">
                     <AlertTriangle className="h-4 w-4" />
                    <span className="font-semibold">Your account is pending approval.</span>
                    <span className="text-sm">An administrator will review your sign-up shortly. Please check back later.</span>
                </div>
            </div>
        </div>
    );
}
