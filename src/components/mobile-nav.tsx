
'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Calculator,
  Lightbulb,
  Users,
  Bell,
  Calendar as CalendarIcon,
  Contact,
  LayoutGrid,
  BarChart3,
  Home,
  X,
  Menu,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

export default function MobileNav() {
  const { user, setIsNavigating } = useAuth();
  const [isMenuOpen, setMenuOpen] = React.useState(false);
  const pathname = usePathname();

  const handleNavLinkClick = () => {
    setIsNavigating(true);
    setMenuOpen(false);
  };
  
  const toggleMenu = () => setMenuOpen(!isMenuOpen);

  const navLinks = React.useMemo(() => {
    const commonLinks = [
        { href: '/', label: 'Home', icon: Home },
        { href: '/projects', label: 'Ecommerce', icon: Package },
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
        { href: '/projects', label: 'Ecommerce', icon: Package },
        { href: '/#stats', label: 'Stats', icon: BarChart3 },
        { href: '/contact', label: 'Contact Us', icon: Contact },
    ];
  }, [user]);

  // Close menu on path change
  React.useEffect(() => {
    if (isMenuOpen) {
      setMenuOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div className="md:hidden fixed bottom-6 right-6 z-[40]">
       {/* Backdrop */}
        {isMenuOpen && (
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                onClick={toggleMenu}
            />
        )}
        
      <div className={cn(
          "absolute bottom-0 right-0 transition-all duration-300 ease-in-out",
          isMenuOpen ? "pointer-events-auto" : "pointer-events-none"
        )}>
          {navLinks.map((link, index) => {
            const style = {
              transform: isMenuOpen
                ? `translateY(-${(index + 1) * 3.75}rem)`
                : 'translateY(0) scale(0.5)',
              transitionDelay: isMenuOpen ? `${index * 40}ms` : '0ms',
              opacity: isMenuOpen ? 1 : 0,
            };

            return (
              <div
                key={link.href}
                className="absolute bottom-0 right-0 transition-all duration-300 ease-in-out"
                style={style}
              >
                <div className="flex items-center justify-end gap-3">
                  <span className={cn(
                      "bg-foreground text-background text-sm font-semibold px-3 py-1.5 rounded-lg shadow-md whitespace-nowrap transition-opacity duration-200",
                      isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                  )}>
                      {link.label}
                  </span>
                  <Button
                      asChild
                      className="rounded-full w-12 h-12 shadow-lg"
                      size="icon"
                      onClick={handleNavLinkClick}
                      aria-label={link.label}
                  >
                      <Link href={link.href}>
                          <link.icon className="h-5 w-5" />
                      </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="relative z-10">
            <Button
                className={cn(
                    "w-14 h-14 rounded-full shadow-lg relative transition-transform duration-300",
                    isMenuOpen ? "bg-destructive hover:bg-destructive/90 scale-110" : ""
                )}
                onClick={toggleMenu}
            >
                <Menu className={cn(
                    "h-6 w-6 absolute transition-all duration-300",
                    isMenuOpen ? 'opacity-0 scale-50 rotate-90' : 'opacity-100 scale-100 rotate-0'
                )} />
                <X className={cn(
                    "h-6 w-6 absolute transition-all duration-300",
                    isMenuOpen ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-90'
                )} />
            </Button>
        </div>
    </div>
  );
}
