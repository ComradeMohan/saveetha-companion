
'use client';

import { useEffect, useState } from 'react';
import Header from './header';
import FeatureAnnouncementBanner from './feature-announcement-banner';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

export default function DynamicHeader() {
    const { user, loading } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();
    const isHomePage = pathname === '/';

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    
    if (loading) return null;

    const bannerMessage = user
        ? "Backend is Down for few days"
        : "Backend has been down for few days.";

    // Determine if the banner should be shown.
    const showBanner = isHomePage && !scrolled;

    return (
        <div className="fixed top-0 left-0 right-0 z-50">
            {isHomePage && (
                 <div className={cn(
                    "transition-transform duration-300",
                    // Hide the banner by translating it up when scrolled
                    scrolled ? "-translate-y-full" : "translate-y-0"
                )}>
                    <FeatureAnnouncementBanner 
                        message={bannerMessage}
                        showButton={!user}
                    />
                </div>
            )}
            {/* The main header is now wrapped in its own transforming div */}
            <div className={cn(
                "px-4 transition-transform duration-300",
                // If the banner is showing, this header is positioned below it.
                // When scrolled, it moves up to the top.
                showBanner && isHomePage ? 'translate-y-0' : '-translate-y-full top-10'
            )}>
                 <Header />
            </div>
        </div>
    );
}
