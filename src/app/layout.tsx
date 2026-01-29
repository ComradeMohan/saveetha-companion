
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import MouseSpotlight from '@/components/mouse-spotlight';
import Script from 'next/script';
import ScrollProgress from '@/components/scroll-progress';
import { Quantico, Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AppProviders } from '@/components/app-providers';

const quantico = Quantico({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-quantico',
  weight: ['400', '700']
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    template: '%s | Saveetha Companion',
    default: 'Saveetha Companion: Your Academic System Interface',
  },
  description: 'Your all-in-one tool for Saveetha Engineering College. Calculate CGPA, track attendance, find concept maps, and get university updates.',
  keywords: ['Saveetha CGPA', 'Saveetha attendance calculator', 'Saveetha Calculator', 'Saveetha attendance', 'Saveetha', 'SEC', 'Saveetha Engineering College', 'Student Companion', 'Faculty Directory'],
  authors: [{ name: 'comrademohan', url: 'https://github.com' }],
  creator: 'comrademohan',
  manifest: '/manifest.json',
  openGraph: {
    title: 'Saveetha Companion: Your Academic System Interface',
    description: 'The ultimate tool for students at Saveetha Engineering College. Simplify your academic life.',
    url: 'https://saveethahub.tech', // Replace with your actual domain
    siteName: 'Saveetha Companion',
    images: [
      {
        url: 'https://saveethahub.tech/favicon.ico', // Replace with a specific OG image URL
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
    title: 'Saveetha Companion: Your Academic System Interface',
    description: 'The ultimate tool for students at Saveetha Engineering College. Simplify your academic life.',
    // creator: '@yourtwitterhandle', // Optional: Replace with your Twitter handle
    images: ['https://saveethahub.tech/favicon.ico'], // Replace with your Twitter card image URL
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

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "hsl(30 100% 98%)" },
    { media: "(prefers-color-scheme: dark)", color: "hsl(222 84% 4.9%)" },
  ],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("scroll-smooth", quantico.variable, inter.variable)} suppressHydrationWarning>
      <head>
          <link rel="canonical" href="https://saveethahub.tech/" />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "Saveetha Companion",
                "url": "https://saveethahub.tech",
              }),
            }}
          />
      </head>
      <body>
        <a href="#main" className="skip-link">Skip to Content</a>
        <ScrollProgress />
        <MouseSpotlight />
        <Suspense fallback={<RootLayoutSkeleton />}>
            <AppProviders>
              {children}
            </AppProviders>
        </Suspense>
        <Toaster />
        
        {/* Google Analytics Scripts */}
        <Script
          key="gtag-js"
          strategy="lazyOnload"
          src="https://www.googletagmanager.com/gtag/js?id=G-LCXQ8TNCNP"
        />
        <Script
          key="gtag-init"
          id="gtag-init"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-LCXQ8TNCNP');
            `,
          }}
        />
        <script async defer src="https://buttons.github.io/buttons.js"></script>
      </body>
    </html>
  );
}
