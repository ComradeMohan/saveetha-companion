'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Calculator,
  GraduationCap,
  Lightbulb,
  Users,
  Mail,
  Menu,
  BookOpenCheck,
  Percent,
  Bell,
  Calendar,
  Contact,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';

const navigationLinks = [
  { href: '#', label: 'Home', icon: GraduationCap },
  { href: '#calculators', label: 'CGPA', icon: Calculator },
  { href: '#calculators', label: 'Attendance', icon: Percent },
  { href: '#concepts', label: 'Concepts', icon: Lightbulb },
  { href: '#faculty', label: 'Faculty', icon: Users },
  { href: '#notifications', label: 'Notifications', icon: Bell },
  { href: '#events', label: 'Events', icon: Calendar },
  { href: '#contact', label: 'Contact Us', icon: Contact },
];

const NavLink = ({
  href,
  children,
  className,
  onClose,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
}) => (
  <Link href={href} passHref>
    <span
      onClick={onClose}
      className={
        'text-sm font-medium text-muted-foreground transition-colors hover:text-primary ' +
        className
      }
    >
      {children}
    </span>
  </Link>
);

export default function Header() {
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">
              Saveetha Companion
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navigationLinks.map(link => (
              <NavLink key={link.href + link.label} href={link.href}>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Mobile Nav */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <Link href="/" className="flex items-center space-x-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="font-bold">Saveetha Companion</span>
            </Link>
            <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
              <div className="flex flex-col space-y-3">
                {navigationLinks.map(link => (
                  <NavLink
                    key={link.href + link.label}
                    href={link.href}
                    onClose={() => setIsSheetOpen(false)}
                    className="flex items-center gap-2 text-lg"
                  >
                    <link.icon className="h-5 w-5" /> {link.label}
                  </NavLink>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <Link
          href="/"
          className="flex items-center space-x-2 md:hidden"
        >
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="font-bold">Saveetha Companion</span>
        </Link>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <Button>Subscribe</Button>
        </div>
      </div>
    </header>
  );
}
