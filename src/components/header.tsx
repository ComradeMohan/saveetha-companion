
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
  ListTree,
  FolderKanban,
  Github,
  Star,
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
import { Badge } from './ui/badge';
import { UpdateProfileDialog } from './update-profile-dialog'; // Import the new dialog
import { NotificationBell } from './notification-bell';
import { AnimatePresence, motion } from 'framer-motion';
import { ScrollArea } from './ui/scroll-area';
import { Skeleton } from './ui/skeleton';

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
            <Link href="/signup">Get Started</Link>
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
        <Button variant="ghost" className="relative h-8 w-8 rounded-full" aria-label="Open user menu">
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
  const [isClient, setIsClient] = React.useState(false);
  const [showStarPrompt, setShowStarPrompt] = React.useState(true);

  React.useEffect(() => {
    setIsClient(true);
    const timer = setTimeout(() => {
        setShowStarPrompt(false);
    }, 5000); // Hide after 5 seconds
    return () => clearTimeout(timer);
  }, []);

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
      { href: '/#features', label: 'Key Features', icon: LayoutGrid },
      { href: '/#calculators', label: 'Calculators', icon: Calculator },
      { href: '/#concepts', label: 'Concept Maps', icon: Lightbulb },
      { href: '/#stats', label: 'Site Stats', icon: BarChart3 },
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
      { href: '/pdd-projects', label: 'PDD Projects', icon: FolderKanban },
      { href: '/hackathons', label: 'Hackathons', icon: Trophy },
      { href: '/internships', label: 'Internships', icon: Briefcase },
      { href: '/jobs', label: 'Remote Jobs', icon: BriefcaseBusiness },
      { href: '/simats-tree', label: 'SIMATS Tree', icon: ListTree },
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
    if (!href.startsWith('http')) {
        setIsNavigating(true);
    }
    setMobileMenuOpen(false);
  }
  
  const loggedInMobileLinks = [
      { href: '/learn', label: 'Learn', icon: Book },
      ...academicsLinks,
      ...resourcesLinks,
      ...toolsDropdownLinks,
  ];
  const loggedOutMobileLinks = [
      ...loggedOutFeaturesLinks,
      { href: '/contact', label: 'Contact', icon: User},
  ];
  const allMobileLinks = user ? loggedInMobileLinks : loggedOutMobileLinks;


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
                    Saveetha Companion
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
                                        <Link href={link.href} onClick={() => setIsNavigating(true)}><link.icon className="mr-2 h-4 w-4" />{link.label}</Link>
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
                <div 
                    className="relative flex items-center"
                    onMouseEnter={() => setShowStarPrompt(false)}
                >
                    <div className={cn(
                        "absolute bottom-full right-0 mb-2 w-max rounded-md bg-foreground px-3 py-1.5 text-sm text-background opacity-0 transition-opacity duration-300",
                        showStarPrompt && "opacity-100"
                    )}>
                        Star this project on GitHub!
                    </div>
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
                {user && <NotificationBell />}
                <ThemeToggle />
                <UserNav />
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
                      {allMobileLinks.map(link => (
                          <motion.div
                              key={link.href}
                              variants={{
                                  open: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
                                  closed: { y: 20, opacity: 0, transition: { duration: 0.2 } }
                              }}
                          >
                              <Link 
                                  href={link.href} 
                                  onClick={() => handleMobileLinkClick(link.href)} 
                                  target={link.href.startsWith('http') ? '_blank' : '_self'}
                                  rel={link.href.startsWith('http') ? 'noopener noreferrer' : ''}
                                  className="flex items-center gap-4 py-3 text-xl font-semibold text-muted-foreground transition-colors hover:text-primary"
                              >
                                  <link.icon className="h-6 w-6"/>
                                  {link.label}
                              </Link>
                          </motion.div>
                      ))}
                  </motion.nav>
                </ScrollArea>
            </motion.div>
        )}
        </AnimatePresence>

    <UpdateProfileDialog open={isProfileDialogOpen} onOpenChange={setProfileDialogOpen} />
    </>
  );
}
