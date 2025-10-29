
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


function MainContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const noHeaderPaths = ['/admin', '/learn', '/batch-admin', '/dev-login'];
    const showHeader = !noHeaderPaths.some(path => pathname.startsWith(path));

    return (
        <>
            {showHeader && <Header />}
            <VerificationBanner key="verification-banner" />
            <RecruitmentDialog />
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
      defaultTheme="light"
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
