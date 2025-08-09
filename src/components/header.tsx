
'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  CheckCircle2,
  Shield,
  LayoutGrid,
  BarChart3,
  User,
  LogOut,
  Menu,
  X,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { useRouter, usePathname } from 'next/navigation';
import { ThemeToggle } from './theme-toggle';
import { cn } from '@/lib/utils';

const NavLink = React.memo(function NavLink({
  href,
  children,
  className,
  onClick,
  isActive,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isActive?: boolean;
}) {
  return (
    <Link href={href} passHref>
      <span
        onClick={onClick}
        className={cn(
          'text-sm font-medium transition-colors hover:text-primary nav-link-hover',
          isActive ? 'text-primary' : 'text-muted-foreground',
          className
        )}
      >
        {children}
      </span>
    </Link>
  );
});

function UserNav() {
  const { user, logout, isAdmin, setIsNavigating } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
        <Button asChild size="sm">
            <Link href="/login">Login</Link>
        </Button>
    );
  }
  
  const handleLogout = async () => {
    setIsNavigating(true);
    await logout();
  }

  const handleProfileClick = () => {
    setIsNavigating(true);
    router.push('/profile');
  };
  
  const handleAdminClick = () => {
    setIsNavigating(true);
    router.push('/admin/dashboard');
  }

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
        {isAdmin && (
           <DropdownMenuItem onClick={handleAdminClick}>
            <Shield className="mr-2 h-4 w-4" />
            <span>Admin</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


export default function Header() {
  const { user, setIsNavigating } = useAuth();
  const pathname = usePathname();
  
  const handleNavLinkClick = () => {
    setIsNavigating(true);
  };
  
  const desktopNavLinks = React.useMemo(() => {
    if (user) {
       return [
            { href: '/projects', label: 'Ecommerce' },
            { href: '/#calculators', label: 'Calculators' },
            { href: '/#concepts', label: 'Concepts' },
            { href: '/#faculty', label: 'Faculty' },
            { href: '/calendar', label: 'Calendar' },
            { href: '/updates', label: 'Updates' },
            { href: '/contact', label: 'Contact Us' },
        ];
    }
    return [
        { href: '/#features', label: 'Features' },
        { href: '/projects', label: 'Ecommerce' },
        { href: '/#stats', label: 'Stats' },
        { href: '/contact', label: 'Contact Us' },
    ];
  }, [user]);

  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-4">
       <div className="container flex h-16 items-center justify-between rounded-full border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mx-auto max-w-5xl shadow-lg px-6">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link href="/" onClick={handleNavLinkClick} className="flex items-center space-x-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">
              Saveetha Companion
            </span>
          </Link>
        </div>
        
        <div className="flex shrink-0 items-center gap-4">
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
             {desktopNavLinks.map(link => {
              const isActive = pathname === link.href || (link.href.startsWith('/#') && pathname === '/');
              return (
                <NavLink key={link.href + link.label} href={link.href} onClick={handleNavLinkClick} isActive={isActive}>
                  {link.label}
                </NavLink>
              );
            })}
          </nav>
          <ThemeToggle />
          <UserNav />
        </div>
       </div>
    </header>
  );
}
