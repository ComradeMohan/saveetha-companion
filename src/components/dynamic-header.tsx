
'use client';

import { useEffect, useState } from 'react';
import Header from './header';
import FeatureAnnouncementBanner from './feature-announcement-banner';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

export default function DynamicHeader() {
    const { user, loading } = useAuth();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    
    if (loading) return null;

    const showBanner = !!user;

    return (
        <div className="fixed top-0 left-0 right-0 z-50">
            <div className={cn(
                "transition-transform duration-300",
                scrolled && showBanner ? "-translate-y-full" : "translate-y-0"
            )}>
                {showBanner && <FeatureAnnouncementBanner />}
            </div>
            <div className={cn(
                "px-4 transition-all duration-300",
                showBanner ? (scrolled ? 'pt-0' : 'pt-4') : 'pt-4'
            )}>
                 <Header />
            </div>
        </div>
    );
}
