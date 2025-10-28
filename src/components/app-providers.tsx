
'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider, ProfileProvider } from '@/hooks/use-auth';
import VerificationBanner from '@/components/verification-banner';
import SupportButton from '@/components/support-button';
import Header from '@/components/header';
import MobileNav from '@/components/mobile-nav';
import NotificationHandler from './NotificationHandler';
import { RecruitmentDialog } from './recruitment-dialog';
import FeatureAnnouncementBanner from './feature-announcement-banner';

function MainContent({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <FeatureAnnouncementBanner />
      <VerificationBanner key="verification-banner" />
      <RecruitmentDialog />
      <main key="main-content">{children}</main>
      <SupportButton />
      <NotificationHandler />
      <MobileNav />
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
