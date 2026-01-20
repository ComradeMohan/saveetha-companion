
'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Home,
  User,
  Book,
  Bot,
  Award
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

export default function MobileNav() {
  const { user, setIsNavigating } = useAuth();
  const pathname = usePathname();

  const navLinks = React.useMemo(() => {
    if (user) {
       return [
            { href: '/', label: 'Home', icon: Home },
            { href: '/ai-chat', label: 'AI Chat', icon: Bot },
            { href: '/learn', label: 'Learn', icon: Book },
            { href: '/profile', label: 'Profile', icon: User },
        ];
    }
    return [
        { href: '/', label: 'Home', icon: Home },
        { href: '/certifications', label: 'Certs', icon: Award },
        { href: '/ai-chat', label: 'AI Chat', icon: Bot },
        { href: '/signup', label: 'Register', icon: User },
    ];
  }, [user]);
  
  const activeIndex = React.useMemo(() => {
    const exactMatchIndex = navLinks.findIndex(link => pathname === link.href);
    if (exactMatchIndex !== -1) return exactMatchIndex;

    if (pathname.startsWith('/admin')) return -1;
    if (pathname === '/') return 0;
    
    const sortedLinks = [...navLinks].sort((a,b) => b.href.length - a.href.length);
    const prefixMatch = sortedLinks.find(link => link.href !== '/' && pathname.startsWith(link.href));
    
    if (prefixMatch) {
      return navLinks.findIndex(link => link.href === prefixMatch.href);
    }
    
    // Special cases for sections not in the nav but should highlight a parent
    if (pathname.startsWith('/learn')) {
        const learnIndex = navLinks.findIndex(link => link.href === '/learn');
        if (learnIndex !== -1) return learnIndex;
    }
     if (pathname.startsWith('/ai-chat')) {
        const chatIndex = navLinks.findIndex(link => link.href === '/ai-chat');
        if (chatIndex !== -1) return chatIndex;
    }

    return -1; 
  }, [pathname, navLinks]);


  const handleNavLinkClick = () => {
    setIsNavigating(true);
  };

  if (pathname.startsWith('/admin') || pathname.startsWith('/learn') || pathname.startsWith('/batch-admin') || pathname.startsWith('/ai-chat')) return null;

  return (
    <div className="md:hidden fixed bottom-4 left-4 right-4 h-16 animate-slide-in-from-bottom">
      <div className="relative mx-auto max-w-xs h-full rounded-full border border-white/20 bg-background/50 shadow-lg backdrop-blur-lg">
         <nav className="flex items-center h-full justify-around">
            {navLinks.map((link, index) => {
                const isActive = activeIndex === index;
                return (
                    <Link key={link.href} href={link.href} className="w-1/4 h-full">
                        <button
                            onClick={handleNavLinkClick}
                            className={cn(
                                "relative z-10 flex flex-col items-center justify-center gap-1 w-full h-full text-xs font-medium transition-colors duration-300",
                                isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                            )}
                        >
                            <link.icon className="h-5 w-5" />
                            <span>{link.label}</span>
                        </button>
                    </Link>
                );
            })}
         </nav>
         {activeIndex !== -1 && (
            <div 
                className="absolute top-0 left-0 h-full w-1/4 flex items-center justify-center transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(calc(${activeIndex} * 100%))` }}
            >
                <div className="h-14 w-14 rounded-full bg-primary/10 backdrop-blur-sm border-t border-primary/20"></div>
            </div>
         )}
      </div>
    </div>
  );
}
