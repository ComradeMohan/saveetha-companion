
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/use-auth';
import { ThemeProvider } from '@/components/theme-provider';
import MouseSpotlight from '@/components/mouse-spotlight';
import Script from 'next/script';
import VerificationBanner from '@/components/verification-banner';
import ScrollProgress from '@/components/scroll-progress';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import MobileNav from '@/components/mobile-nav';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});


export const metadata: Metadata = {
  title: {
    template: '%s | Saveetha Companion',
    default: 'Saveetha Companion - Your All-in-One Academic Hub',
  },
  description: 'Your all-in-one academic hub for Saveetha Engineering College. Calculate CGPA, track attendance, find resources, and connect with faculty, all in one place.',
  keywords: ['Saveetha', 'CGPA Calculator', 'Attendance Tracker', 'Faculty Directory', 'Student Companion', 'SEC'],
  authors: [{ name: 'comrademohan', url: 'https://github.com/comrademohan' }],
  creator: 'comrademohan',
  openGraph: {
    title: 'Saveetha Companion - Your All-in-One Academic Hub',
    description: 'Calculate CGPA, track attendance, find concept maps, and get important updates for Saveetha Engineering College.',
    url: 'https://saveetha-companion.web.app', // Replace with your actual domain
    siteName: 'Saveetha Companion',
    images: [
      {
        url: 'https://placehold.co/1200x630.png', // Replace with a specific OG image URL
        width: 1200,
        height: 630,
        alt: 'Saveetha Companion App Interface',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Saveetha Companion - Your All-in-One Academic Hub',
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
          <main key="main-content">{children}</main>
          <Toaster key="toaster" />
          <MobileNav />
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
    <html lang="en" className={cn("scroll-smooth", inter.variable)} suppressHydrationWarning>
      <head>
      </head>
      <body className="font-body antialiased bg-background text-foreground overflow-x-hidden">
        <ScrollProgress />
        <MouseSpotlight />
        <AppProviders>{children}</AppProviders>
        
        {/* Google Analytics Scripts - Moved to end of body */}
        <Script
          key="gtag-js"
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-SV60C81VTM"
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
              gtag('config', 'G-SV60C81VTM');
            `,
          }}
        />
      </body>
    </html>
  );
}
