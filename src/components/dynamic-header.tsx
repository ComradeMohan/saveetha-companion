
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

    const showBanner = isHomePage && !scrolled;

    return (
        <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
            {isHomePage && (
                 <div className={cn(
                    "transition-transform duration-300",
                    scrolled ? "-translate-y-full" : "translate-y-0"
                )}>
                    <FeatureAnnouncementBanner 
                        message={bannerMessage}
                        showButton={!user}
                    />
                </div>
            )}
            <div className={cn(
                "px-4 transition-transform duration-300",
                showBanner ? "translate-y-0" : "-translate-y-10"
            )}>
                 <Header />
            </div>
        </header>
    );
}
