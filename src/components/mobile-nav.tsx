
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
    const activeLinkIndex = navLinks.findIndex(link => pathname === link.href);
    // Default to home if no match is found, e.g. on nested pages
    return activeLinkIndex !== -1 ? activeLinkIndex : 0;
  }, [pathname, navLinks]);


  const handleNavLinkClick = () => {
    setIsNavigating(true);
  };

  if (!user) return null;

  return (
    <div className="md:hidden fixed bottom-4 left-4 right-4 z-50 h-16 animate-slide-in-from-bottom">
      <div className="relative mx-auto max-w-sm h-full rounded-full border border-black/5 bg-background/30 shadow-lg backdrop-blur-xl dark:border-white/5 liquid-glass-nav">
         <nav className="flex items-center justify-around h-full">
            {navLinks.map((link, index) => {
                const isActive = activeIndex === index;
                return (
                    <Link key={link.href} href={link.href} passHref>
                        <button
                            onClick={handleNavLinkClick}
                            className={cn(
                                "relative z-10 flex flex-col items-center justify-center gap-1 w-16 h-full text-xs font-medium transition-colors duration-300",
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
            className="absolute top-0 left-0 h-full w-16 flex items-center justify-center transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(calc(${activeIndex} * 100%))` }}
        >
            <div className="h-16 w-16 rounded-full bg-primary/10 backdrop-blur-sm border-t border-primary/20"></div>
        </div>
      </div>
    </div>
  );
}
