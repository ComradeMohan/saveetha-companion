
'use client';

import { useAuth } from '@/hooks/use-auth';
import FeatureAnnouncementBanner from './feature-announcement-banner';

export default function AuthDependentBanner() {
    const { user, loading } = useAuth();

    if (loading) {
        return null; // Don't show anything while loading to prevent flashes
    }
    
    // Only show the banner if the user is logged in
    if (user) {
        return <FeatureAnnouncementBanner />;
    }

    return null;
}
