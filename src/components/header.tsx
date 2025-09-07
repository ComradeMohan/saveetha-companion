
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
  Award,
  ChevronDown,
  ClipboardList,
  Book,
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
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useRouter, usePathname } from 'next/navigation';
import { ThemeToggle } from './theme-toggle';
import { cn } from '@/lib/utils';
import FeatureAnnouncementBanner from './feature-announcement-banner';
import { Badge } from './ui/badge';
import { UpdateProfileDialog } from './update-profile-dialog'; // Import the new dialog

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
  const { user, profile, setIsNavigating } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isProfileDialogOpen, setProfileDialogOpen] = React.useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLearnClick = () => {
    if (user) {
        if (profile?.department && profile?.college) {
            setIsNavigating(true);
            router.push('/learn');
        } else {
            setProfileDialogOpen(true);
        }
    } else {
        // This button is not shown for logged-out users, but as a fallback:
        setIsNavigating(true);
        router.push('/login');
    }
  };
  
  const mainNavLinks = React.useMemo(() => {
    if (user) {
       return [
            { href: '/#calculators', label: 'Calculators' },
            { href: '/#concepts', label: 'Concepts' },
            { href: '/course-enrollment', label: 'Enrollment Alert' },
            { href: '/certifications', label: 'Certifications' },
            { href: '/calendar', label: 'Calendar' },
            { href: '/updates', label: 'Updates' },
            { href: '/contact', label: 'Contact Us' },
        ];
    }
    // Links for logged-out users
    return [
        { href: '/certifications', label: 'Certifications' },
        { href: '/contact', label: 'Contact Us' },
    ];
  }, [user]);

  const featuresDropdownLinks = [
      { href: '/#features', label: 'Key Features' },
      { href: '/#calculators', label: 'Calculators' },
      { href: '/#concepts', label: 'Concept Maps' },
      { href: '/#stats', label: 'Site Stats' },
  ];

  const handleMobileLinkClick = (href: string) => {
    setIsNavigating(true);
    router.push(href);
    setMobileMenuOpen(false);
  }

  if (pathname.startsWith('/learn') || pathname.startsWith('/admin')) {
    return null; // Don't render this header in the admin or learning zones
  }

  return (
    <>
    <header className="fixed top-4 left-0 right-0 z-50 px-4">
       <div className="container flex h-16 items-center justify-between rounded-full border border-black/5 bg-background/30 p-2 shadow-lg backdrop-blur-xl dark:border-white/5 sm:px-6 liquid-glass-nav">
        <div className="flex items-center gap-4">
          <Link href="/" onClick={() => setIsNavigating(true)} className="flex items-center space-x-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">
              Saveetha Calculator
            </span>
          </Link>
        </div>
        
        <div className="flex shrink-0 items-center gap-2 md:gap-4">
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
             {!user && (
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="text-sm font-medium transition-colors text-muted-foreground hover:text-primary px-0">
                           Features <ChevronDown className="ml-1 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {featuresDropdownLinks.map(link => (
                            <DropdownMenuItem key={link.href} asChild>
                                <Link href={link.href} onClick={() => setIsNavigating(true)}>{link.label}</Link>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                 </DropdownMenu>
             )}
             {mainNavLinks.map(link => {
              const isActive = pathname === link.href || (link.href.startsWith('/#') && pathname === '/');
              return (
                <NavLink key={link.href + link.label} href={link.href} onClick={() => setIsNavigating(true)} isActive={isActive}>
                  {link.label}
                </NavLink>
              );
            })}
            {user && (
              <button
                onClick={handleLearnClick}
                className="flex items-center gap-1.5 text-sm font-medium transition-colors text-muted-foreground hover:text-primary nav-link-hover"
              >
                  <Book className="h-4 w-4" />
                  Learn
                  <Badge variant="destructive" className="animate-bounce">New</Badge>
              </button>
            )}
          </nav>
          <ThemeToggle />
          <UserNav />
           <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="h-5 w-5"/>
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left">
                    <nav className="grid gap-6 text-lg font-medium mt-8">
                        <Link href="/" onClick={() => handleMobileLinkClick('/')} className="flex items-center gap-2 text-lg font-semibold">
                            <GraduationCap className="h-6 w-6 text-primary" />
                            <span>Saveetha Calculator</span>
                        </Link>
                         {!user && (
                             featuresDropdownLinks.map(link => (
                                <Link key={link.href} href={link.href} onClick={() => handleMobileLinkClick(link.href)} className="text-muted-foreground hover:text-foreground">
                                    {link.label}
                                </Link>
                             ))
                         )}
                         {mainNavLinks.map(link => (
                            <Link key={link.href} href={link.href} onClick={() => handleMobileLinkClick(link.href)} className="text-muted-foreground hover:text-foreground">
                                {link.label}
                            </Link>
                         ))}
                         {user && (
                              <button onClick={() => {
                                handleLearnClick();
                                setMobileMenuOpen(false);
                              }} className="text-muted-foreground hover:text-foreground text-left flex items-center gap-1.5">
                                 Learn <Badge variant="destructive" className="animate-bounce">New</Badge>
                              </button>
                         )}
                    </nav>
                </SheetContent>
            </Sheet>
        </div>
       </div>
    </header>
    <UpdateProfileDialog open={isProfileDialogOpen} onOpenChange={setProfileDialogOpen} />
    </>
  );
}
