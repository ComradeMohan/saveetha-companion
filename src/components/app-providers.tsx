
'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider, ProfileProvider } from '@/hooks/use-auth';
import Header from '@/components/header';
import Footer from '@/components/footer';
import MobileNav from '@/components/mobile-nav';
import NotificationHandler from './NotificationHandler';
import { usePathname } from 'next/navigation';
import SeasonalEffects from './SeasonalEffects';
import GlobalToastManager from './GlobalToastManager';

function MainContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    
    const isAdminOrLearnPath = pathname.startsWith('/admin') || pathname.startsWith('/learn') || pathname.startsWith('/batch-admin');
    const showHeaderAndFooter = !isAdminOrLearnPath && pathname !== '/ai-chat';

    return (
        <div className="flex min-h-screen flex-col">
            {showHeaderAndFooter && <Header />}
            <SeasonalEffects />
            <GlobalToastManager /> 
            <main id="main" key="main-content" className="flex-1">
              {children}
            </main>
            {showHeaderAndFooter && <MobileNav />}
            {showHeaderAndFooter && <Footer />}
            <NotificationHandler />
        </div>
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
