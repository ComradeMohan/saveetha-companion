
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, LayoutDashboard, Users, BookOpen, MessageSquare, LogOut, Calendar, UserCircle, Inbox, Megaphone, BarChartHorizontal, BrainCircuit, Package, Award, ClipboardList, School, PenSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { ScrollArea } from '../ui/scroll-area';

const adminNavLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: UserCircle },
  { href: '/admin/faculty', label: 'Faculty', icon: Users },
  { href: '/admin/enrollments', label: 'Enrollment Alerts', icon: ClipboardList },
  { href: '/admin/student-cgpa', label: 'Student CGPA', icon: BarChartHorizontal },
  { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { href: '/admin/requests', label: 'Requests', icon: Inbox },
  { href: '/admin/concept-maps', label: 'Concept Maps', icon: BookOpen },
  { href: '/admin/certifications', label: 'Certifications', icon: Award },
  { href: '/admin/calendar', label: 'Calendar', icon: Calendar },
  { href: '/admin/updates', label: 'Updates', icon: Megaphone },
  { href: '/admin/tutor', label: 'AI Tutor', icon: BrainCircuit },
  { href: '/admin/college-learnings', label: 'College Learnings', icon: School },
  { href: '/admin/course-content', label: 'Course Content', icon: PenSquare },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="hidden border-r bg-background md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link
                    href="/"
                    className="group flex items-center gap-2 font-semibold"
                >
                    <GraduationCap className="h-6 w-6 text-primary transition-all group-hover:scale-110" />
                    <span className="font-bold">Saveetha Admin</span>
                </Link>
            </div>
            
            <ScrollArea className="flex-1">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                    {adminNavLinks.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                                pathname.startsWith(link.href) && 'bg-muted text-primary'
                            )}
                        >
                            <link.icon className="h-4 w-4" />
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </ScrollArea>
            
            <div className="mt-auto p-4 border-t">
                <button 
                    onClick={logout} 
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </button>
            </div>
        </div>
    </aside>
  );
}
