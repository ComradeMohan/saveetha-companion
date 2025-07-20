
'use client';

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/use-auth';
import { ThemeProvider } from '@/components/theme-provider';
import MouseSpotlight from '@/components/mouse-spotlight';
import Script from 'next/script';
import VerificationBanner from '@/components/verification-banner';
import useFcm from '@/hooks/use-fcm';
import { useAuth } from '@/hooks/use-auth';

function FcmProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    // Only mount the FCM hook if there is a logged-in user
    if(user) {
        return <FcmHandler>{children}</FcmHandler>;
    }
    return <>{children}</>;
}

function FcmHandler({ children }: { children: React.ReactNode }) {
    useFcm();
    return <>{children}</>;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        ></link>
        {/* Google Analytics Scripts */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-SV60C81VTM"
        />
        <Script
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
      </head>
      <body className="font-body antialiased bg-background text-foreground overflow-x-hidden">
        <MouseSpotlight />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          <AuthProvider>
            <FcmProvider>
              <VerificationBanner />
              {children}
              <Toaster />
            </FcmProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
