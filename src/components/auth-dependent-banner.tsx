
'use client';

import { useAuth } from '@/hooks/use-auth';
import FeatureAnnouncementBanner from './feature-announcement-banner';

// This component is no longer used, as banner logic is now inside DynamicHeader.
// It is kept to prevent build errors if it is imported elsewhere, but it returns null.
export default function AuthDependentBanner() {
    return null;
}
