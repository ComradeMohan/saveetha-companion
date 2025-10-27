
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
  QrCode,
  Keyboard,
  Eye,
  Calculator,
  Lightbulb,
  Calendar,
  Bell,
  PenSquare,
  Trophy,
  Briefcase,
  BriefcaseBusiness,
  Link as LinkIcon,
  Code,
  Users2,
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
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useRouter, usePathname } from 'next/navigation';
import { ThemeToggle } from './theme-toggle';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import { UpdateProfileDialog } from './update-profile-dialog'; // Import the new dialog
import { NotificationBell } from './notification-bell';
import { ScrollArea } from './ui/scroll-area';

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
  const { user, logout, isAdmin, isBatchAdmin, setIsNavigating } = useAuth();
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
  
  const handleBatchAdminClick = () => {
    setIsNavigating(true);
    router.push('/batch-admin');
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
            <span>Admin Panel</span>
          </DropdownMenuItem>
        )}
        {isBatchAdmin && (
           <DropdownMenuItem onClick={handleBatchAdminClick}>
            <Users2 className="mr-2 h-4 w-4" />
            <span>Batch Admin</span>
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
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLearnClick = () => {
    if (user) {
        if (profile?.department && profile?.college) {
            setIsNavigating(true);
            router.push('/learn/dashboard');
        } else {
            setProfileDialogOpen(true);
        }
    } else {
        setIsNavigating(true);
        router.push('/login');
    }
  };
  
  const loggedOutFeaturesLinks = [
      { href: '/#features', label: 'Key Features' },
      { href: '/#calculators', label: 'Calculators' },
      { href: '/#concepts', label: 'Concept Maps' },
      { href: '/#stats', label: 'Site Stats' },
  ];
  
  const academicsLinks = [
      { href: '/#calculators', label: 'Calculators', icon: Calculator },
      { href: '/#concepts', label: 'Concept Maps', icon: Lightbulb },
      { href: '/course-enrollment', label: 'Enrollment Alert', icon: ClipboardList },
      { href: '/calendar', label: 'Calendar', icon: Calendar },
  ];
  
  const resourcesLinks = [
      { href: '/certifications', label: 'Certifications', icon: Award },
      { href: '/projects', label: 'Project Marketplace', icon: Package },
      { href: '/hackathons', label: 'Hackathons', icon: Trophy },
      { href: '/internships', label: 'Internships', icon: Briefcase },
      { href: '/jobs', label: 'Remote Jobs', icon: BriefcaseBusiness },
      { href: '/updates', label: 'Updates', icon: Bell },
  ];

  const toolsDropdownLinks = [
      { href: '/tools/placement-prep', label: 'Placement Prep', icon: GraduationCap },
      { href: '/tools/sandbox', label: 'Coding Sandbox', icon: Code },
      { href: '/tools/link-drop', label: 'Link Drop', icon: LinkIcon },
      { href: '/tools/qr-generator', label: 'QR Code Generator', icon: QrCode },
      { href: '/tools/typing-test', label: 'Typing Test', icon: Keyboard },
      { href: '/tools/steganography', label: 'Steganography', icon: Eye },
      { href: '/tools/reverse-dictionary', label: 'Reverse Dictionary', icon: Book },
      { href: '/tools/citation-generator', label: 'Citation Generator', icon: PenSquare },
  ]

  const handleMobileLinkClick = (href: string) => {
    setIsNavigating(true);
    router.push(href);
    setMobileMenuOpen(false);
  }

  if (pathname.startsWith('/admin') || pathname.startsWith('/learn') || pathname.startsWith('/batch-admin') || pathname.startsWith('/dev-login')) {
    return null; // Don't render this header in the admin or learning zones
  }

  return (
    <>
       <header className="fixed top-0 left-0 right-0 z-50 px-4 transition-all duration-300" style={{ transform: `translateY(${scrolled ? '-0.5rem' : '0rem'})`}}>
            <div className="container flex h-16 items-center justify-between rounded-full border border-black/5 bg-background/30 p-2 shadow-lg backdrop-blur-xl dark:border-white/5 liquid-glass-nav mt-4">
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
                    {user ? (
                        <>
                            <button
                                onClick={handleLearnClick}
                                className="flex items-center gap-1.5 text-sm font-medium transition-colors text-muted-foreground hover:text-primary nav-link-hover"
                            >
                                <Book className="h-4 w-4" />
                                Learn
                                <Badge variant="destructive" className="animate-bounce">New</Badge>
                            </button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="text-sm font-medium transition-colors text-muted-foreground hover:text-primary px-0">
                                    Academics <ChevronDown className="ml-1 h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    {academicsLinks.map(link => (
                                        <DropdownMenuItem key={link.href} asChild>
                                            <Link href={link.href} onClick={() => setIsNavigating(true)}>
                                                <link.icon className="mr-2 h-4 w-4" />
                                                {link.label}
                                            </Link>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="text-sm font-medium transition-colors text-muted-foreground hover:text-primary px-0">
                                    Resources <ChevronDown className="ml-1 h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    {resourcesLinks.map(link => (
                                        <DropdownMenuItem key={link.href} asChild>
                                            <Link href={link.href} onClick={() => setIsNavigating(true)}>
                                                <link.icon className="mr-2 h-4 w-4" />
                                                {link.label}
                                            </Link>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="text-sm font-medium transition-colors text-muted-foreground hover:text-primary px-0">
                                Features <ChevronDown className="ml-1 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {loggedOutFeaturesLinks.map(link => (
                                    <DropdownMenuItem key={link.href} asChild>
                                        <Link href={link.href} onClick={() => setIsNavigating(true)}>{link.label}</Link>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="text-sm font-medium transition-colors text-muted-foreground hover:text-primary px-0">
                                Tools <ChevronDown className="ml-1 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {toolsDropdownLinks.map(link => (
                                <DropdownMenuItem key={link.href} asChild>
                                    <Link href={link.href} onClick={() => setIsNavigating(true)}>
                                        {typeof link.icon === 'string' ? <div className="mr-2 h-4 w-4" /> : <link.icon className="mr-2 h-4 w-4" />}
                                        {link.label}
                                    </Link>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <NavLink href="/contact" onClick={() => setIsNavigating(true)} isActive={pathname === '/contact'}>
                        Contact Us
                    </NavLink>
                </nav>
                {user && <NotificationBell />}
                <ThemeToggle />
                <UserNav />
                <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-5 w-5"/>
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col p-0">
                            <SheetHeader className="p-4 border-b">
                                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                            </SheetHeader>
                            <ScrollArea className="flex-1">
                                <nav className="grid gap-6 text-lg font-medium mt-4 px-6">
                                    <Link href="/" onClick={() => handleMobileLinkClick('/')} className="flex items-center gap-2 text-lg font-semibold mb-4">
                                        <GraduationCap className="h-6 w-6 text-primary" />
                                        <span>Saveetha Calculator</span>
                                    </Link>
                                    {user ? (
                                        <>
                                            {academicsLinks.map(link => (
                                                <Link key={link.href} href={link.href} onClick={() => handleMobileLinkClick(link.href)} className="text-muted-foreground hover:text-foreground">{link.label}</Link>
                                            ))}
                                            {resourcesLinks.map(link => (
                                                <Link key={link.href} href={link.href} onClick={() => handleMobileLinkClick(link.href)} className="text-muted-foreground hover:text-foreground">{link.label}</Link>
                                            ))}
                                            {toolsDropdownLinks.map(link => (
                                                <Link key={link.href} href={link.href} onClick={() => handleMobileLinkClick(link.href)} className="text-muted-foreground hover:text-foreground">{link.label}</Link>
                                            ))}
                                            <button onClick={() => { handleLearnClick(); setMobileMenuOpen(false); }} className="text-muted-foreground hover:text-foreground text-left flex items-center gap-1.5">
                                                Learn <Badge variant="destructive" className="animate-bounce">New</Badge>
                                            </button>
                                        </>
                                    ) : (
                                        loggedOutFeaturesLinks.map(link => (
                                            <Link key={link.href} href={link.href} onClick={() => handleMobileLinkClick(link.href)} className="text-muted-foreground hover:text-foreground">
                                                {link.label}
                                            </Link>
                                        ))
                                    )}
                                    <Link href="/contact" onClick={() => handleMobileLinkClick('/contact')} className="text-muted-foreground hover:text-foreground">Contact Us</Link>
                                </nav>
                            </ScrollArea>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    <UpdateProfileDialog open={isProfileDialogOpen} onOpenChange={setProfileDialogOpen} />
    </>
  );
}
