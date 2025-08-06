'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, LayoutDashboard, Users, BookOpen, MessageSquare, LogOut, Calendar, UserCircle, Inbox, Megaphone, BarChartHorizontal, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '../ui/tooltip';

const adminNavLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: UserCircle },
  { href: '/admin/faculty', label: 'Faculty', icon: Users },
  { href: '/admin/student-cgpa', label: 'Student CGPA', icon: BarChartHorizontal },
  { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { href: '/admin/requests', label: 'Requests', icon: Inbox },
  { href: '/admin/concept-maps', label: 'Concept Maps', icon: BookOpen },
  { href: '/admin/calendar', label: 'Calendar', icon: Calendar },
  { href: '/admin/updates', label: 'Updates', icon: Megaphone },
  { href: '/admin/tutor', label: 'AI Tutor', icon: BrainCircuit },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex lg:w-56">
        <TooltipProvider>
            <nav className="flex flex-col items-center gap-4 px-2 sm:py-5 lg:items-start lg:px-4">
                <Link
                    href="/"
                    className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 lg:h-9 lg:w-auto lg:px-3 lg:py-2 lg:self-stretch"
                >
                    <GraduationCap className="h-4 w-4 transition-all group-hover:scale-110 lg:h-5 lg:w-5" />
                    <span className="hidden lg:inline-block font-bold">Saveetha</span>
                    <span className="sr-only">Saveetha Companion</span>
                </Link>
                {adminNavLinks.map(link => (
                    <Tooltip key={link.href}>
                        <TooltipTrigger asChild>
                        <Link
                            href={link.href}
                            className={cn(
                                "flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8 lg:h-9 lg:w-full lg:justify-start lg:px-3",
                                pathname.startsWith(link.href) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            <link.icon className="h-5 w-5 lg:h-4 lg:w-4" />
                            <span className="ml-4 hidden lg:inline">{link.label}</span>
                            <span className="sr-only" suppressHydrationWarning>{link.label}</span>
                        </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="lg:hidden">{link.label}</TooltipContent>
                    </Tooltip>
                ))}
            </nav>
            <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5 lg:items-start lg:px-4">
                <Tooltip>
                    <TooltipTrigger asChild>
                    <button onClick={logout} className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8 lg:h-9 lg:w-full lg:justify-start lg:px-3">
                        <LogOut className="h-5 w-5 lg:h-4 lg:w-4" />
                        <span className="ml-4 hidden lg:inline">Logout</span>
                        <span className="sr-only lg:hidden">Logout</span>
                    </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="lg:hidden">Logout</TooltipContent>
                </Tooltip>
            </nav>
        </TooltipProvider>
    </aside>
  );
}
