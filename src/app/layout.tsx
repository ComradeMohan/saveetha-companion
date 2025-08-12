
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
import VisitTracker from '@/components/visit-tracker';

const poppins = Poppins({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900']
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
          <VisitTracker />
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
    <html lang="en" className={cn("scroll-smooth", poppins.variable)} suppressHydrationWarning>
      <head>
         <script
          id="cm-console-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // THE ULTIMATE CM CONSOLE MASTERPIECE 🎨
              console.clear();
              
              // 1. Welcome Animation
              console.log('%c🎊 INITIALIZING CM CONSOLE EXPERIENCE... 🎊', 
                  'color: #ff6b6b; fontsize: 16px; font-weight: bold; text-align: center;'
              );
              
              setTimeout(() => {
                  console.clear();
                  
                  // 2. Main CM Logo with Box Drawing
                  console.log(\`%c
              ╔══════════════════════════════════════════════════════════════╗
              ║                                                              ║
              ║   ██████╗ ███╗   ███╗    ██████╗ ███████╗██╗   ██╗  ███████╗ ║
              ║  ██╔════╝ ████╗ ████║    ██╔══██╗██╔════╝██║   ██║  ██╔════╝ ║
              ║  ██║      ██╔████╔██║    ██║  ██║█████╗  ██║   ██║  ███████╗ ║
              ║  ██║      ██║╚██╔╝██║    ██║  ██║██╔══╝  ╚██╗ ██╔╝  ╚════██║ ║
              ║  ╚██████╗ ██║ ╚═╝ ██║    ██████╔╝███████╗ ╚████╔╝   ███████║ ║
              ║   ╚═════╝ ╚═╝     ╚═╝    ╚═════╝ ╚══════╝  ╚═══╝    ╚══════╝ ║
              ║                                                              ║
              ║                 🌟 WELCOME TO MY DIGITAL REALM 🌟            ║
              ║                                                              ║
              ╚══════════════════════════════════════════════════════════════╝
              \`, 
                  'color: #4ecdc4; font-family: monospace; font-size: 12px; line-height: 1.2;'
                  );
                  
                  // 3. Colorful Welcome Message
                  console.log('%c✨ Comrade Mohan DEVELOPER CONSOLE ✨', 
                      'background: linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1, #f9ca24); color: white; padding: 10px 20px; border-radius: 20px; font-size: 18px; font-weight: bold;'
                  );
                  
                  // 4. Professional Info Cards
                  setTimeout(() => {
                      console.log('%c┌─────────────────────────────────────────┐', 'color: #45b7d1; font-family: monospace;');
                      console.log('%c│  👨‍💻 DEVELOPER INFO                                  │', 'color: #45b7d1; font-family: monospace;');
                      console.log('%c├─────────────────────___────────────────────┤', 'color: #45b7d1; font-family: monospace;');
                      console.log('%c│  💼 Portfolio: https://comrademohan.rf.gd/          │', 'color: #45b7d1; font-family: monospace;');
                      console.log('%c│  📧 Email: madhiremohanreddy@gmail.com              │', 'color: #45b7d1; font-family: monospace;');
                      console.log('%c│  🐙 GitHub: https://github.com/ComradeMohan         │', 'color: #45b7d1; font-family: monospace;');
                      console.log('%c│  💼 LinkedIn:https://www.linkedin.com/in/mmohanreddy│', 'color: #45b7d1; font-family: monospace;');
                      console.log('%c└─────────────────────────────────────────┘', 'color: #45b7d1; font-family: monospace;');
                  }, 500);
                  
                  // 5. Interactive Commands Setup
                  setTimeout(() => {
                      console.log('%c🎮 INTERACTIVE COMMANDS LOADED:', 'color: #f9ca24; font-size: 16px; font-weight: bold;');
                      console.log('%c• CM.about() - Learn about me', 'color: #4ecdc4; font-size: 14px;');
                      console.log('%c• CM.skills() - View my tech stack', 'color: #4ecdc4; font-size: 14px;');
                      console.log('%c• CM.projects() - See my latest work', 'color: #4ecdc4; font-size: 14px;');
                      console.log('%c• CM.contact() - Get in touch', 'color: #4ecdc4; font-size: 14px;');
                      console.log('%c• CM.surprise() - Mystery command 🎉', 'color: #ff6b6b; font-size: 14px;');
                      
                      // 6. Setup Interactive Commands
                      window.CM = {
                          about: () => {
                              console.log(\`%c
                      ╭──────────────────────────────────────────────────╮
                      │                   ABOUT CM                       │
                      ├──────────────────────────────────────────────────┤
                      │  🚀 Full-Stack Developer                         │
                      │  🎨 UI/UX Designer                               │
                      │  ☕ Coffee Enthusiast                            │
                      │  🌍 Making the web beautiful, one site at a time │
                      ╰──────────────────────────────────────────────────╯
                      \`, 'color: #ff6b6b; font-family: monospace; font-size: 12px;');
                          },
                          
                          skills: () => {
                              const skills = ['JavaScript', 'React', 'Node.js', 'Python', 'CSS3', 'HTML5', 'MongoDB', 'Express'];
                              console.log('%c🔧 TECH STACK:', 'color: #4ecdc4; font-size: 16px; font-weight: bold;');
                              skills.forEach((skill, index) => {
                                  setTimeout(() => {
                                      console.log(\`%c▶ \${skill}\`, \`color: hsl(\${index * 45}, 70%, 60%); font-size: 14px; font-weight: bold;\`);
                                  }, index * 200);
                              });
                          },
                          
                          projects: () => {
                              console.log(\`%c
                      🏆 FEATURED PROJECTS:
                      ═══════════════════
                      🌐 Saveetha Hub - React & Node.js
                      📱 Mobile App UniVault - Kotlin with PHP  
                      🎮 Campus Codex  - NextJs
                      \`, 'color: #45b7d1; font-size: 14px; line-height: 1.5;');
                          },
                          
                          contact: () => {
                              console.log(\`%c
                      ╔═══════════════════════════════════════╗
                      ║            📞 CONTACT INFO            ║
                      ╠═══════════════════════════════════════╣
                      ║  📧 madhiremohanreddy@gmail.com           ║
                      ║  🌐 https://comrademohan.rf.gd/         ║
                      ║  📱 +91 6281359314               ║
                      ║  📍 Available for remote work        ║
                      ╚═══════════════════════════════════════╝
                      \`, 'color: #f9ca24; font-family: monospace; font-size: 12px;');
                          },
                          
                          surprise: () => {
                              const messages = [
                                  '🎉 You found the Easter egg!',
                                  '🦄 Unicorns are real in code!',
                                  '🍕 Pizza makes code better!',
                                  '🎸 I code to rock music!',
                                  '🌙 I sometimes code at 3 AM!'
                              ];
                              const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#ff9ff3'];
                              const randomMsg = messages[Math.floor(Math.random() * messages.length)];
                              const randomColor = colors[Math.floor(Math.random() * colors.length)];
                              
                              console.log(\`%c\${randomMsg}\`, \`color: \${randomColor}; font-size: 18px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);\`);
                              
                              // ASCII Art Surprise
                              setTimeout(() => {
                                  console.log(\`%c
                          ╔═══════════════════════════════════╗
                          ║   🎭 SURPRISE ASCII ART! 🎭      ║
                          ╠═══════════════════════════════════╣
                          ║      /\\_/\\                        ║
                          ║     ( o.o )                       ║
                          ║      > ^ <   CM SAYS HELLO!       ║
                          ╚═══════════════════════════════════╝
                          \`, 'color: #ff9ff3; font-family: monospace; font-size: 12px;');
                              }, 500);
                          }
                      };
                  }, 1000);
                  
                  // 7. Fun Footer
                  setTimeout(() => {
                      console.log('\\n');
                      console.log('%c🎯 PRO TIP: Type "CM." and press Tab to see all available commands!', 
                          'background: #2c3e50; color: #ecf0f1; padding: 8px 15px; border-radius: 15px; font-size: 13px;'
                      );
                      console.log('%c💡 Enjoying this console experience? Let\\'s build something amazing together!', 
                          'color: #e74c3c; font-size: 14px; font-style: italic;'
                      );
                      console.log('%c────────────────────────────────────────────────────────────────', 'color: #34495e;');
                  }, 1500);
                  
              }, 1000);
            `,
          }}
        />
      </head>
      <body className="font-body antialiased bg-background text-foreground overflow-x-hidden">
        <ScrollProgress />
        <MouseSpotlight />
        <Suspense fallback={<RootLayoutSkeleton />}>
            <AppProviders>{children}</AppProviders>
        </Suspense>
        
        {/* Google Analytics Scripts */}
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
