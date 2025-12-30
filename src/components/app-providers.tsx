'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider, ProfileProvider } from '@/hooks/use-auth';
import VerificationBanner from '@/components/verification-banner';
import SupportButton from '@/components/support-button';
import Header from '@/components/header';
import MobileNav from '@/components/mobile-nav';
import NotificationHandler from './NotificationHandler';
import { RecruitmentDialog } from './recruitment-dialog';
import { usePathname } from 'next/navigation';
import PromotionalDialog from './PromotionalDialog';
import SeasonalEffects from './SeasonalEffects';
import GlobalToastManager from './GlobalToastManager'; // Import the new component
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function MainContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading } = useAuth();
    
    const publicPaths = ['/landing', '/login', '/signup', '/contact', '/privacy', '/terms', '/copyright', '/takedown', '/datasafety', '/faq'];
    const isPublicPath = publicPaths.includes(pathname);
    const isAdminOrLearnPath = pathname.startsWith('/admin') || pathname.startsWith('/learn') || pathname.startsWith('/batch-admin') || pathname.startsWith('/dev-login');

    useEffect(() => {
        if (!loading && !user && !isPublicPath && !isAdminOrLearnPath) {
            router.push('/landing');
        }
    }, [user, loading, isPublicPath, isAdminOrLearnPath, router]);

    const showHeader = !isAdminOrLearnPath && (isPublicPath || user);


    return (
        <>
            {showHeader && <Header />}
            <VerificationBanner key="verification-banner" />
            <RecruitmentDialog />
            <PromotionalDialog />
            <SeasonalEffects />
            <GlobalToastManager /> 
            <main key="main-content">{children}</main>
            {showHeader && <SupportButton />}
            {showHeader && <MobileNav />}
            <NotificationHandler />
        </>
    );
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      disableTransitionOnChange
    >
      <AuthProvider>
        <ProfileProvider>
            <MainContent>{children}</MainContent>
        </ProfileProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
