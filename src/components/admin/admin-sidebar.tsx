
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, LayoutDashboard, Users, BookOpen, MessageSquare, Bell, LogOut, Calendar, UserCircle, Inbox, Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '../ui/tooltip';

const adminNavLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: UserCircle },
  { href: '/admin/faculty', label: 'Faculty', icon: Users },
  { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { href: '/admin/requests', label: 'Requests', icon: Inbox },
  { href: '/admin/concept-maps', label: 'Concept Maps', icon: BookOpen },
  { href: '/admin/calendar', label: 'Calendar', icon: Calendar },
<<<<<<< HEAD
<<<<<<< HEAD
=======
  { href: '/admin/notifications', label: 'Notifications', icon: Bell },
>>>>>>> 9ad8fd7 (no i need make fcm services. Learn more)
=======
  { href: '/admin/updates', label: 'Updates', icon: Megaphone },
>>>>>>> 5561b7e (on click notification url not opening mak an another page to d=sa =ve th)
];

const disabledLinks = [
    { href: '/admin/notifications', label: 'Notifications', icon: Bell, disabled: true },
]

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
<<<<<<< HEAD
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <TooltipProvider>
            <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
                <Link
                    href="/"
                    className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
                >
                    <GraduationCap className="h-4 w-4 transition-all group-hover:scale-110" />
                    <span className="sr-only">Saveetha Companion</span>
                </Link>
                {adminNavLinks.map(link => (
                    <Tooltip key={link.href}>
                        <TooltipTrigger asChild>
                        <Link
                            href={link.href}
                            className={cn(
                                "flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8",
                                pathname.startsWith(link.href) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            <link.icon className="h-5 w-5" />
                            <span className="sr-only">{link.label}</span>
                        </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right">{link.label}</TooltipContent>
                    </Tooltip>
                ))}
            </nav>
            <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
                <Tooltip>
                    <TooltipTrigger asChild>
                    <button onClick={logout} className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8">
                        <LogOut className="h-5 w-5" />
                        <span className="sr-only">Logout</span>
                    </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Logout</TooltipContent>
                </Tooltip>
            </nav>
        </TooltipProvider>
=======
    <aside className="hidden md:flex h-screen w-64 flex-col border-r bg-background sticky top-0">
      <div className="flex h-16 items-center border-b px-6 flex-shrink-0">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span>Saveetha Companion</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-2 p-4 overflow-y-auto">
        {adminNavLinks.map((link) => (
          <Button
            key={link.href}
            asChild
            variant={pathname.startsWith(link.href) ? 'secondary' : 'ghost'}
            className="w-full justify-start"
          >
            <Link href={link.href}>
              <link.icon className="mr-2 h-4 w-4" />
              {link.label}
            </Link>
          </Button>
        ))}
      </nav>
      <div className="mt-auto p-4 border-t flex-shrink-0">
          <Button variant="ghost" className="w-full justify-start" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4"/>
              Log Out
          </Button>
      </div>
>>>>>>> 5561b7e (on click notification url not opening mak an another page to d=sa =ve th)
    </aside>
  );
}
