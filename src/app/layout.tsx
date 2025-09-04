
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/use-auth';
import { ThemeProvider } from '@/components/theme-provider';
import MouseSpotlight from '@/components/mouse-spotlight';
import Script from 'next/script';
import VerificationBanner from '@/components/verification-banner';
import ScrollProgress from '@/components/scroll-progress';
import { Poppins } from 'next/font/google';
import { cn } from '@/lib/utils';
import MobileNav from '@/components/mobile-nav';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import FeedbackDialog from '@/components/feedback-dialog';
import SupportButton from '@/components/support-button';

const poppins = Poppins({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900']
});

export const metadata: Metadata = {
  title: {
    template: '%s | Saveetha Calculator',
    default: 'Saveetha Calculator: CGPA & Attendance',
  },
  description: 'The ultimate tool for Saveetha Engineering College students. Instantly calculate your Saveetha CGPA and attendance percentage. Find faculty info, concept maps, and important university updates all in one place.',
  keywords: ['Saveetha CGPA', 'Saveetha attendance calculator', 'Saveetha Calculator', 'Saveetha attendance', 'Saveetha', 'SEC', 'Saveetha Engineering College', 'Student Companion', 'Faculty Directory'],
  authors: [{ name: 'comrademohan', url: 'https://github.com/comrademohan' }],
  creator: 'comrademohan',
  openGraph: {
    title: 'Saveetha Calculator: CGPA & Attendance',
    description: 'The ultimate tool for students at Saveetha Engineering College. Simplify your academic life.',
    url: 'https://saveetha-companion.web.app', // Replace with your actual domain
    siteName: 'Saveetha Calculator',
    images: [
      {
        url: 'https://placehold.co/1200x630.png', // Replace with a specific OG image URL
        width: 1200,
        height: 630,
        alt: 'Saveetha Calculator App Interface',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Saveetha Calculator: CGPA & Attendance',
    description: 'The ultimate tool for students at Saveetha Engineering College. Simplify your academic life.',
    // creator: '@yourtwitterhandle', // Optional: Replace with your Twitter handle
    images: ['https://placehold.co/1200x630.png'], // Replace with your Twitter card image URL
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

function RootLayoutSkeleton() {
    return (
        <div className="flex h-screen w-full flex-col">
            <header className="fixed top-4 left-0 right-0 z-50 px-4">
                <div className="container flex h-16 items-center justify-between rounded-full border bg-background/95 px-6 shadow-lg">
                    <Skeleton className="h-8 w-32" />
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-8 w-24 hidden md:block" />
                        <Skeleton className="h-8 w-24 hidden md:block" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                </div>
            </header>
            <main className="flex-1 pt-24">
                <div className="container mx-auto px-4">
                    <Skeleton className="h-[70vh] w-full" />
                </div>
            </main>
        </div>
    );
}

// Client-side provider wrapper
function AppProviders({ children }: { children: React.ReactNode }) {
  'use client';

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      disableTransitionOnChange
    >
      <AuthProvider>
          <VerificationBanner key="verification-banner" />
          <FeedbackDialog />
          <main key="main-content">{children}</main>
          <Toaster key="toaster" />
          <MobileNav />
          <SupportButton />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("scroll-smooth", poppins.variable)} suppressHydrationWarning>
      <head>
      </head>
      <body className="font-body antialiased bg-background text-foreground overflow-x-hidden">
        <ScrollProgress />
        <MouseSpotlight />
        <Suspense fallback={<RootLayoutSkeleton />}>
            <AppProviders>
              {children}
            </AppProviders>
        </Suspense>
        
        {/* Google Analytics Scripts */}
        <Script
          key="gtag-js"
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-LCXQ8TNCNP"
        />
        <Script
          key="gtag-init"
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-LCXQ8TNCNP');
            `,
          }}
        />
      </body>
    </html>
  );
}
