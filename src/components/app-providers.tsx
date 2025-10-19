
'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import VerificationBanner from '@/components/verification-banner';
import FeedbackDialog from '@/components/feedback-dialog';
import SupportButton from '@/components/support-button';
import DynamicHeader from '@/components/dynamic-header';
import MobileNav from '@/components/mobile-nav';
import NotificationPermissionBanner from '@/components/notification-permission-banner';

function MainContent({ children }: { children: React.ReactNode }) {
  const { showNotificationBanner, setShowNotificationBanner, setupFCM } = useAuth();
  
  const handleEnableNotifications = () => {
    setupFCM();
    setShowNotificationBanner(false);
  };
  
  const handleDismissBanner = () => {
    localStorage.setItem('notificationBannerDismissed', 'true');
    setShowNotificationBanner(false);
  };

  return (
    <>
      <DynamicHeader />
      <VerificationBanner key="verification-banner" />
      <FeedbackDialog />
      <main key="main-content">{children}</main>
      <SupportButton />
      <MobileNav />
      <NotificationPermissionBanner 
        show={showNotificationBanner}
        onEnable={handleEnableNotifications}
        onDismiss={handleDismissBanner}
      />
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
