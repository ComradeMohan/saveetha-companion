
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, LayoutDashboard, Users, BookOpen, MessageSquare, Bell, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { useAuth } from '@/hooks/use-auth';

const adminNavLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/faculty', label: 'Faculty', icon: Users },
  { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { href: '/admin/concept-maps', label: 'Concept Maps', icon: BookOpen },
  { href: '/admin/notifications', label: 'Notifications', icon: Bell, disabled: true },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span>Saveetha Companion</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-2 p-4">
        {adminNavLinks.map((link) => (
          <Button
            key={link.href}
            asChild
            variant={pathname.startsWith(link.href) ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            disabled={link.disabled}
          >
            <Link href={link.href}>
              <link.icon className="mr-2 h-4 w-4" />
              {link.label}
            </Link>
          </Button>
        ))}
      </nav>
      <div className="mt-auto p-4">
          <Button variant="ghost" className="w-full justify-start" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4"/>
              Log Out
          </Button>
      </div>
    </aside>
  );
}
