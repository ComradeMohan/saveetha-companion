
'use client';

import { Rocket } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";

interface FeatureAnnouncementBannerProps {
    message: string;
    showButton?: boolean;
    buttonText?: string;
    buttonLink?: string;
}

export default function FeatureAnnouncementBanner({ 
    message, 
    showButton = false, 
    buttonText = "Login Now",
    buttonLink = "/login"
}: FeatureAnnouncementBannerProps) {
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
        <div className="relative z-40 w-full overflow-hidden bg-secondary text-secondary-foreground shadow-md">
            <div className="flex h-10 items-center">
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
