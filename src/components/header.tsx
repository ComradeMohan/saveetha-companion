'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Menu,
  X,
  ChevronDown,
  Calculator,
  Lightbulb,
  Calendar,
  ClipboardList,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './theme-toggle';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { ScrollArea } from './ui/scroll-area';
import { Skeleton } from './ui/skeleton';

const NavLink = React.memo(function NavLink({
  href,
  children,
  className,
  isActive,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  isActive?: boolean;
}) {
  return (
    <Link href={href} passHref>
      <span
        className={cn(
          'text-sm font-medium transition-colors hover:text-primary nav-link-hover cursor-pointer',
          isActive ? 'text-primary' : 'text-muted-foreground',
          className
        )}
      >
        {children}
      </span>
    </Link>
  );
});

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);
  const [showStarPrompt, setShowStarPrompt] = React.useState(true);

  React.useEffect(() => {
    setIsClient(true);
    const timer = setTimeout(() => {
      setShowStarPrompt(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const academicsLinks = [
    { href: '/#calculators', label: 'Calculators', icon: Calculator },
    { href: '/#concepts', label: 'Concept Maps', icon: Lightbulb },
    { href: '/projects', label: 'Projects', icon: Package },
    { href: '/course-enrollment', label: 'Enrollment Alert', icon: ClipboardList },
    { href: '/calendar', label: 'Calendar', icon: Calendar },
  ];

  if (pathname.startsWith('/admin') || pathname.startsWith('/learn') || pathname.startsWith('/batch-admin')) {
    return null;
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 px-4 transition-all duration-300" style={{ transform: `translateY(${scrolled ? '-0.5rem' : '0rem'})` }}>
        <div className="container flex h-16 items-center justify-between rounded-full border border-black/5 bg-background/30 p-2 shadow-lg backdrop-blur-xl dark:border-white/5 liquid-glass-nav mt-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center space-x-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="hidden font-bold sm:inline-block">
                Saveetha Companion
              </span>
            </Link>
          </div>

          <div className="flex shrink-0 items-center gap-2 md:gap-4">
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-sm font-medium transition-colors text-muted-foreground hover:text-primary px-0">
                    Academics <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {academicsLinks.map(link => (
                    <DropdownMenuItem key={link.href} asChild>
                      <Link href={link.href}>
                        <link.icon className="mr-2 h-4 w-4" />
                        {link.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <NavLink href="/contact" isActive={pathname === '/contact'}>
                Contact Us
              </NavLink>
            </nav>

            <div className="relative flex items-center">
              <AnimatePresence>
                {showStarPrompt && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full right-0 mb-2 w-max rounded-md bg-foreground px-3 py-1.5 text-sm text-background shadow-xl"
                  >
                    Star this project on GitHub!
                  </motion.div>
                )}
              </AnimatePresence>
              {isClient ? (
                <div className="h-8 flex items-center rounded-md border border-input bg-background px-2">
                  <a className="github-button"
                    href="https://github.com/ComradeMohan/saveetha-companion"
                    data-icon="octicon-star"
                    data-size="large"
                    data-show-count="true"
                    data-color-scheme="no-preference: light; light: light; dark: dark;"
                    aria-label="Star ComradeMohan/saveetha-companion on GitHub">
                    Star
                  </a>
                </div>
              ) : (
                <Skeleton className="h-8 w-24" />
              )}
            </div>

            <ThemeToggle />
            
            <div className="md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}>
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    key={isMobileMenuOpen ? 'x' : 'menu'}
                    initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </motion.div>
                </AnimatePresence>
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-lg md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <ScrollArea className="h-full pt-24 pb-8">
              <motion.nav
                className="p-8 space-y-1"
                initial="closed"
                animate="open"
                exit="closed"
                variants={{
                  open: {
                    transition: { staggerChildren: 0.07, delayChildren: 0.2 }
                  },
                  closed: {
                    transition: { staggerChildren: 0.05, staggerDirection: -1 }
                  }
                }}
              >
                {academicsLinks.map(link => (
                  <motion.div
                    key={link.href}
                    variants={{
                      open: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
                      closed: { y: 20, opacity: 0, transition: { duration: 0.2 } }
                    }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-4 py-3 text-xl font-semibold text-muted-foreground transition-colors hover:text-primary"
                    >
                      <link.icon className="h-6 w-6" />
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                  variants={{
                    open: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
                    closed: { y: 20, opacity: 0, transition: { duration: 0.2 } }
                  }}
                >
                  <Link
                    href="/contact"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-4 py-3 text-xl font-semibold text-muted-foreground transition-colors hover:text-primary"
                  >
                    <Calendar className="h-6 w-6" />
                    Contact Us
                  </Link>
                </motion.div>
              </motion.nav>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
