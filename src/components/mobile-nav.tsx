
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

  const handleNavLinkClick = () => {
    setIsNavigating(true);
  };
  
  const navLinks = React.useMemo(() => {
    if (user) {
       return [
            { href: '/', label: 'Home', icon: Home },
            { href: '/calendar', label: 'Calendar', icon: CalendarIcon },
            { href: '/updates', label: 'Updates', icon: Bell },
            { href: '/profile', label: 'Profile', icon: User },
        ];
    }
    return []; // No nav bar for logged-out users on mobile
  }, [user]);

  if (!user) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 border-t bg-background/80 backdrop-blur-lg animate-slide-in-from-bottom">
       <nav className="flex items-center justify-around h-full">
            {navLinks.map((link) => {
                const isActive = (pathname === link.href) || (pathname === '/' && link.href === '/');
                return (
                    <Link key={link.href} href={link.href} passHref>
                        <button
                            onClick={handleNavLinkClick}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 w-20 h-full text-xs font-medium transition-colors",
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
    </div>
  );
}
