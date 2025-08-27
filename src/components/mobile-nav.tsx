
'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Home,
  Calendar as CalendarIcon,
  Bell,
  User,
  Calculator,
  Package,
  Award,
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
            { href: '/certifications', label: 'Certs', icon: Award },
            { href: '/calendar', label: 'Calendar', icon: CalendarIcon },
            { href: '/profile', label: 'Profile', icon: User },
        ];
    }
    return [
        { href: '/', label: 'Home', icon: Home },
        { href: '/certifications', label: 'Certs', icon: Award },
        { href: '/projects', label: 'Projects', icon: Package },
        { href: '/login', label: 'Login', icon: User },
    ];
  }, [user]);
  
  const activeIndex = React.useMemo(() => {
    // Find the best match for the current path
    const exactMatchIndex = navLinks.findIndex(link => pathname === link.href);
    if (exactMatchIndex !== -1) return exactMatchIndex;

    // Handle nested routes, e.g., /projects/some-id should still highlight a main nav item if applicable
    if (pathname.startsWith('/admin')) return -1; // Don't highlight anything for admin
    if (pathname === '/') return 0;
    
    // Find the first link whose href is a prefix of the current path
    const sortedLinks = [...navLinks].sort((a,b) => b.href.length - a.href.length);
    const prefixMatch = sortedLinks.find(link => link.href !== '/' && pathname.startsWith(link.href));
    
    if (prefixMatch) {
      return navLinks.findIndex(link => link.href === prefixMatch.href);
    }

    return -1; 
  }, [pathname, navLinks]);


  const handleNavLinkClick = () => {
    setIsNavigating(true);
  };

  if (pathname.startsWith('/admin')) return null;

  return (
    <div className="md:hidden fixed bottom-4 left-4 right-4 z-50 h-16 animate-slide-in-from-bottom">
      <div className="relative mx-auto max-w-xs h-full rounded-full border border-black/5 bg-background/30 shadow-lg backdrop-blur-xl dark:border-white/5 liquid-glass-nav">
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
