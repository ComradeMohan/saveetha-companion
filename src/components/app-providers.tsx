
'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider, ProfileProvider } from '@/hooks/use-auth';
import VerificationBanner from '@/components/verification-banner';
import Header from '@/components/header';
import Footer from '@/components/footer';
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
import { AiChatPopover } from './ai-chat-popover';

function MainContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading } = useAuth();
    
    const publicPaths = ['/login', '/signup', '/contact', '/privacy', '/terms', '/copyright', '/takedown', '/datasafety', '/faq'];
    const isAdminOrLearnPath = pathname.startsWith('/admin') || pathname.startsWith('/learn') || pathname.startsWith('/batch-admin') || pathname.startsWith('/dev-login');

    useEffect(() => {
        if (loading) return; // Don't do anything until auth state is resolved

        const isPublicPath = publicPaths.includes(pathname) || pathname === '/' || pathname.startsWith('/projects') || pathname.startsWith('/pdd-projects');

        if (user) {
            // User is logged in
            if (pathname === '/') {
                router.push('/dashboard');
            }
        } else {
            // User is not logged in
            if (!isPublicPath && !isAdminOrLearnPath) {
                router.push('/login');
            }
        }
    }, [user, loading, pathname, router]);

    const showHeaderAndFooter = !isAdminOrLearnPath;


    return (
        <div className="flex min-h-screen flex-col">
            {showHeaderAndFooter && <Header />}
            <VerificationBanner key="verification-banner" />
            <RecruitmentDialog />
            <PromotionalDialog />
            <SeasonalEffects />
            <GlobalToastManager /> 
            <main key="main-content" className="flex-1">
              {children}
            </main>
            {showHeaderAndFooter && (
              <div className="hidden md:block fixed bottom-6 right-6 z-50">
                  <AiChatPopover />
              </div>
            )}
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
