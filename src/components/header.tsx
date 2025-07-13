
'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Calculator,
  GraduationCap,
  Lightbulb,
  Users,
  Menu,
  Percent,
  Bell,
  Calendar,
  Contact,
  LogOut,
  User,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useAuth } from '@/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useRouter } from 'next/navigation';

const navigationLinks = [
  { href: '/', label: 'Home', icon: GraduationCap },
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

function UserNav() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <Button asChild>
        <Link href="/login">Login</Link>
      </Button>
    );
  }
  
  const handleLogout = async () => {
    await logout();
    router.push('/login');
  }

  const handleProfileClick = () => {
    router.push('/profile');
  };
  
  const userInitials = user.displayName ? user.displayName.slice(0, 2).toUpperCase() : <User className="h-4 w-4" />;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? ''} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.displayName}</p>
            <div className="flex items-center gap-1">
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
              {user.emailVerified && <CheckCircle2 className="h-3 w-3 text-green-500" />}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleProfileClick}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


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
            {navigationLinks.slice(1, 5).map(link => (
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
          <UserNav />
        </div>
      </div>
    </header>
  );
}
