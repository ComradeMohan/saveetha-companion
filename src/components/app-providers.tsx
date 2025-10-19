
'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/hooks/use-auth';
import VerificationBanner from '@/components/verification-banner';
import FeedbackDialog from '@/components/feedback-dialog';
import SupportButton from '@/components/support-button';
import DynamicHeader from '@/components/dynamic-header';
import MobileNav from '@/components/mobile-nav';
import NotificationHandler from './NotificationHandler';

function MainContent({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DynamicHeader />
      <VerificationBanner key="verification-banner" />
      <FeedbackDialog />
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
        <MainContent>{children}</MainContent>
      </AuthProvider>
    </ThemeProvider>
  );
}
