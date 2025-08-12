
'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Home,
  Calendar as CalendarIcon,
  Bell,
  User,
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
            { href: '/calendar', label: 'Calendar', icon: CalendarIcon },
            { href: '/updates', label: 'Updates', icon: Bell },
            { href: '/profile', label: 'Profile', icon: User },
        ];
    }
    return [];
  }, [user]);
  
  const activeIndex = React.useMemo(() => {
    // Find the best match for the current path
    const exactMatchIndex = navLinks.findIndex(link => pathname === link.href);
    if (exactMatchIndex !== -1) return exactMatchIndex;

    // Handle nested routes, e.g., /projects/some-id should still highlight a main nav item if applicable
    // For this app, we can default to 'Home' if no other direct match is found
    if (pathname.startsWith('/admin')) return -1; // Don't highlight anything for admin
    if (pathname === '/') return 0;
    
    // Find the first link whose href is a prefix of the current path
    const prefixMatchIndex = navLinks.map(l => l.href).sort((a,b) => b.length - a.length).findIndex(href => href !== '/' && pathname.startsWith(href));
    if (prefixMatchIndex !== -1) return navLinks.findIndex(l => l.href === navLinks.map(l => l.href).sort((a,b) => b.length - a.length)[prefixMatchIndex]);

    return 0; // Default to home
  }, [pathname, navLinks]);


  const handleNavLinkClick = () => {
    setIsNavigating(true);
  };

  if (!user || pathname.startsWith('/admin')) return null;

  return (
    <div className="md:hidden fixed bottom-4 left-4 right-4 z-50 h-16 animate-slide-in-from-bottom">
      <div className="relative mx-auto max-w-xs h-full rounded-full border border-black/5 bg-background/30 shadow-lg backdrop-blur-xl dark:border-white/5 liquid-glass-nav">
         <nav className="flex items-center h-full">
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
         <div 
            className="absolute top-0 left-0 h-full w-1/4 flex items-center justify-center transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(calc(${activeIndex} * 100%))` }}
        >
            <div className="h-14 w-14 rounded-full bg-primary/10 backdrop-blur-sm border-t border-primary/20"></div>
        </div>
      </div>
    </div>
  );
}
