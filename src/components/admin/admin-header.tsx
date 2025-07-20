
'use client';

import Link from 'next/link';
<<<<<<< HEAD
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { GraduationCap, LayoutDashboard, Users, BookOpen, MessageSquare, Bell, LogOut, Calendar, UserCircle, Inbox, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { usePathname } from 'next/navigation';
=======
import { Button } from '../ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  BookOpen,
  MessageSquare,
  Bell,
  LogOut,
  Menu,
  Calendar,
  UserCircle,
  Inbox,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
>>>>>>> 60e24e6 (make admin nav bar mobile responsive)

const adminNavLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: UserCircle },
  { href: '/admin/faculty', label: 'Faculty', icon: Users },
  { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { href: '/admin/requests', label: 'Requests', icon: Inbox },
  { href: '/admin/concept-maps', label: 'Concept Maps', icon: BookOpen },
  { href: '/admin/calendar', label: 'Calendar', icon: Calendar },
  { href: '/admin/notifications', label: 'Notifications', icon: Bell },
];

export default function AdminHeader() {
  const { logout } = useAuth();
<<<<<<< HEAD
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
=======

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline">
>>>>>>> 60e24e6 (make admin nav bar mobile responsive)
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
<<<<<<< HEAD
        <SheetContent side="left" className="sm:max-w-xs">
          <SheetHeader>
            <SheetTitle className="sr-only">Admin Menu</SheetTitle>
            <SheetDescription className="sr-only">
              Navigation menu for the admin dashboard.
            </SheetDescription>
          </SheetHeader>
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/"
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
            >
              <GraduationCap className="h-5 w-5 transition-all group-hover:scale-110" />
              <span className="sr-only">Saveetha Companion</span>
            </Link>
            {adminNavLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-4 px-2.5 ${pathname.startsWith(link.href) ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
=======
        <SheetContent side="left">
          <SheetHeader className='mb-4'>
            <SheetTitle className='sr-only'>Admin Menu</SheetTitle>
            <SheetDescription className='sr-only'>Admin navigation menu</SheetDescription>
          </SheetHeader>
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold mb-4"
          >
            <GraduationCap className="h-6 w-6 text-primary" />
            <span>Saveetha Companion</span>
          </Link>
          <nav className="grid gap-2 text-lg font-medium">
            {adminNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
>>>>>>> 60e24e6 (make admin nav bar mobile responsive)
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </Link>
            ))}
<<<<<<< HEAD
             <button
                onClick={logout}
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
                <LogOut className="h-5 w-5" />
                Log Out
            </button>
          </nav>
        </SheetContent>
      </Sheet>
       <Link href="/" className="flex items-center gap-2 font-semibold">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="font-bold">Admin Panel</span>
        </Link>
=======
          </nav>
          <div className="absolute bottom-4 left-4 right-4">
            <Button variant="ghost" className="w-full justify-start" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4"/>
                Log Out
            </Button>
          </div>
        </SheetContent>
      </Sheet>
>>>>>>> 60e24e6 (make admin nav bar mobile responsive)
    </header>
  );
}
