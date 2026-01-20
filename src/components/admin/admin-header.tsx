
'use client';

import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  BookOpen,
  MessageSquare,
  LogOut,
  Calendar,
  UserCircle,
  Inbox,
  Menu,
  Megaphone,
  BarChartHorizontal,
  BrainCircuit,
  Package,
  Award,
  ClipboardList,
  School,
  PenSquare,
  FileQuestion,
  Gift,
  GitBranch,
  Code,
  Hand,
  UserCog,
  FileJson,
  Sparkles,
  Share2,
  MessagesSquare
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { usePathname } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ReportIssueDialog } from './report-issue-dialog';

const adminNavLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: UserCircle },
  { href: '/admin/batch-admin', label: 'Batch Admins', icon: UserCog },
  { href: '/admin/faculty', label: 'Faculty', icon: Users },
  { href: '/admin/updates', label: 'Updates', icon: Megaphone },
  { href: '/admin/notifications', label: 'Notifications', icon: Megaphone },
  { href: '/admin/effects', label: 'Seasonal Effects', icon: Sparkles },
  { href: '/admin/enrollments', label: 'Enrollment Alerts', icon: ClipboardList },
  { href: '/admin/recruitment', label: 'Recruitment', icon: Hand },
  { href: '/admin/student-cgpa', label: 'Student CGPA', icon: BarChartHorizontal },
  { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { href: '/admin/chat-logs', label: 'Chat Logs', icon: MessagesSquare },
  { href: '/admin/requests', label: 'Requests', icon: Inbox },
  { href: '/admin/college-learnings', label: 'College Learnings', icon: School },
  { href: '/admin/course-content', label: 'Course Content', icon: PenSquare },
  { href: '/admin/mcqs', label: 'MCQs', icon: FileQuestion },
  { href: '/admin/coding-questions', label: 'Coding Questions', icon: Code },
  { href: '/admin/concept-maps', label: 'Concept Maps', icon: BookOpen },
  { href: '/admin/certifications', label: 'Certifications', icon: Award },
  { href: '/admin/credits', label: 'Credit Management', icon: Gift },
  { href: '/admin/calendar', label: 'Calendar', icon: Calendar },
  { href: '/admin/tutor', label: 'AI Tutor', icon: BrainCircuit },
  { href: '/admin/course-suggestions', label: 'Course Suggestions', icon: FileQuestion },
];

const learnNavLinks = [
    { href: '/learn/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/learn', label: 'Roadmap', icon: GitBranch },
    { href: '/learn/courses', label: 'My Courses', icon: BookOpen },
    { href: '/learn/coding', label: 'Coding', icon: Code },
    { href: '/learn/profile', label: 'Profile', icon: UserCircle },
];

const batchAdminNavLinks = [
    { href: '/batch-admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/batch-admin/certifications', label: 'Certifications', icon: Award },
    { href: '/batch-admin/concept-maps', label: 'Concept Maps', icon: BookOpen },
];

export default function AdminHeader() {
  const { logout, isBatchAdmin } = useAuth();
  const pathname = usePathname();

  const isLearnSection = pathname.startsWith('/learn');
  const isBatchAdminSection = pathname.startsWith('/batch-admin');
  
  let links = adminNavLinks;
  let siteTitle = 'Admin Panel';

  if (isLearnSection) {
      links = learnNavLinks;
      siteTitle = 'Learning Zone';
  } else if (isBatchAdminSection) {
      links = batchAdminNavLinks;
      siteTitle = 'Batch Admin';
  }


  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
            <SheetHeader>
                <SheetTitle>
                    <Link
                        href="/"
                        className="group flex items-center gap-2 font-semibold"
                    >
                        <GraduationCap className="h-6 w-6 text-primary transition-all group-hover:scale-110" />
                        <span className="font-bold">{siteTitle}</span>
                    </Link>
                </SheetTitle>
            </SheetHeader>
          <ScrollArea className="flex-1">
            <nav className="grid gap-2 text-lg font-medium my-4">
              {links.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-4 px-2.5 ${pathname.startsWith(link.href) ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              ))}
            </nav>
          </ScrollArea>
            <div className="mt-auto border-t pt-4">
                 <button
                    onClick={logout}
                    className="flex w-full items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                    <LogOut className="h-5 w-5" />
                    Log Out
                </button>
            </div>
        </SheetContent>
      </Sheet>
       <div className="w-full flex-1">
         <h1 className="font-semibold text-lg">{siteTitle}</h1>
       </div>
       {isBatchAdminSection && <ReportIssueDialog />}
    </header>
  );
}
