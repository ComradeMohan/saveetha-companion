
'use client';

import { useEffect, useState } from 'react';
import Header from './header';
import FeatureAnnouncementBanner from './feature-announcement-banner';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import NotificationPermissionBanner from './notification-permission-banner';

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
        ? "New Feature: The Course Enrollment auto-checker is now live! Get notified instantly."
        : "Course Enrollment auto-checker is now live! Login to get notified instantly.";

    return (
        <div className="fixed top-0 left-0 right-0 z-50">
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
                "px-4 transition-all duration-300",
                !scrolled && isHomePage ? 'pt-4' : 'pt-0'
            )}>
                 <Header />
            </div>
            <NotificationPermissionBanner />
        </div>
    );
}
