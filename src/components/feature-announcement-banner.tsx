
'use client';

import { Rocket } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";

interface FeatureAnnouncementBannerProps {}

export default function FeatureAnnouncementBanner(props: FeatureAnnouncementBannerProps) {
    const { user, loading } = useAuth();
    const pathname = usePathname();
    const isHomePage = pathname === '/';
    
    if (loading || !isHomePage) {
        return null;
    }

    const message = user
        ? "Backend is Down for few days"
        : "Backend has been down for few days.";
    const showButton = !user;
    const buttonText = "Login Now";
    const buttonLink = "/login";
    
    const announcement = (
        <div className="flex items-center gap-2 px-6 py-2">
            <Rocket className="h-4 w-4 flex-shrink-0" />
            <span className="font-semibold">{message}</span>
            {showButton && (
                <Button asChild size="sm" className="ml-4 h-6 rounded-full">
                    <Link href={buttonLink}>{buttonText}</Link>
                </Button>
            )}
        </div>
    );

    return (
        <div className="relative z-40 w-full overflow-hidden bg-secondary text-secondary-foreground shadow-md h-10">
            <div className="flex h-full items-center">
                <div className="relative flex h-full items-center overflow-hidden">
                    <div className="animate-scroll-text flex whitespace-nowrap">
                        {announcement}
                        <div aria-hidden="true">
                            {announcement}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
