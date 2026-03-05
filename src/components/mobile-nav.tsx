
'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Home,
  Book,
  Calendar,
  Package,
  Award
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

export default function MobileNav() {
  const { setIsNavigating } = useAuth();
  const pathname = usePathname();

  const navLinks = React.useMemo(() => {
    return [
        { href: '/', label: 'Home', icon: Home },
        { href: '/projects', label: 'Projects', icon: Package },
        { href: '/calendar', label: 'Events', icon: Calendar },
        { href: '/certifications', label: 'Certs', icon: Award },
    ];
  }, []);
  
  const activeIndex = React.useMemo(() => {
    const exactMatchIndex = navLinks.findIndex(link => pathname === link.href);
    if (exactMatchIndex !== -1) return exactMatchIndex;

    if (pathname.startsWith('/admin')) return -1;
    
    if (pathname === '/') {
        return navLinks.findIndex(link => link.href === '/');
    }
    
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
