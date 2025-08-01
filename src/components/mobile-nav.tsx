
'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Calculator,
  Lightbulb,
  Users,
  Menu,
  Bell,
  Calendar as CalendarIcon,
  Contact,
  LayoutGrid,
  BarChart3,
  X,
  Home,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

export default function MobileNav() {
  const { user, setIsNavigating, isMobileMenuOpen, setMobileMenuOpen } = useAuth();
  const pathname = usePathname();

  const handleNavLinkClick = () => {
    setIsNavigating(true);
    setMobileMenuOpen(false);
  };
  
  const toggleMenu = () => setMobileMenuOpen(!isMobileMenuOpen);

  const navLinks = React.useMemo(() => {
    const commonLinks = [
        { href: '/', label: 'Home', icon: Home },
        { href: '/#calculators', label: 'Calculators', icon: Calculator },
        { href: '/#concepts', label: 'Concepts', icon: Lightbulb },
        { href: '/#faculty', label: 'Faculty', icon: Users },
        { href: '/calendar', label: 'Calendar', icon: CalendarIcon },
    ];
    if (user) {
       return [
            ...commonLinks,
            { href: '/updates', label: 'Updates', icon: Bell },
        ];
    }
    return [
        { href: '/', label: 'Home', icon: Home },
        { href: '/#features', label: 'Features', icon: LayoutGrid },
        { href: '/#stats', label: 'Stats', icon: BarChart3 },
        { href: '/contact', label: 'Contact Us', icon: Contact },
    ];
  }, [user]);

  // Close menu on path change
  React.useEffect(() => {
    if (isMobileMenuOpen) {
      setMobileMenuOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-[99]">
       {/* Backdrop */}
        {isMobileMenuOpen && (
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                onClick={toggleMenu}
            />
        )}
        
      <div className={cn(
          "absolute bottom-6 right-6 transition-all duration-300 ease-in-out",
          isMobileMenuOpen ? "pointer-events-auto" : "pointer-events-none"
        )}>
          {navLinks.map((link, index) => {
            const angle = (index * (90 / (navLinks.length -1)));
            const style = {
              transform: isMobileMenuOpen
                ? `rotate(${angle}deg) translate(7rem) rotate(-${angle}deg)`
                : 'translate(0,0)',
              transitionDelay: isMobileMenuOpen ? `${index * 50}ms` : '0ms',
              opacity: isMobileMenuOpen ? 1 : 0,
            };

            return (
              <div
                key={link.href}
                className="absolute bottom-0 right-0"
                style={style}
              >
                 <div className="relative">
                    <Button
                        asChild
                        className="rounded-full w-14 h-14 shadow-lg"
                        onClick={handleNavLinkClick}
                        aria-label={link.label}
                    >
                        <Link href={link.href}>
                            <link.icon className="h-6 w-6" />
                        </Link>
                    </Button>
                    <span className={cn(
                        "absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-foreground text-background text-xs font-semibold px-2 py-1 rounded-md shadow-md whitespace-nowrap transition-opacity duration-200",
                        isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    )}>
                        {link.label}
                    </span>
                 </div>
              </div>
            );
          })}
        </div>
    </div>
  );
}

