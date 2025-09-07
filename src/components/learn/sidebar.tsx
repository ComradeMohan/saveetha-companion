
'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GraduationCap, LayoutDashboard, Book, User as UserIcon, LogOut, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const learnNavLinks = [
  { href: '/learn', label: 'Roadmap', icon: LayoutDashboard },
  { href: '/learn/courses', label: 'My Courses', icon: Book },
  { href: '/learn/profile', label: 'Profile', icon: UserIcon },
];

export default function LearnSidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const userInitials = user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : <UserIcon className="h-4 w-4" />;

    return (
        <div className="hidden border-r bg-background md:block">
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <GraduationCap className="h-6 w-6 text-primary" />
                        <span className="">Learning Zone</span>
                    </Link>
                </div>
                <div className="flex-1">
                    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                        {learnNavLinks.map(link => (
                             <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                                    pathname === link.href && "bg-muted text-primary"
                                )}
                            >
                                <link.icon className="h-4 w-4" />
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="mt-auto p-4 border-t">
                    <div className="flex items-center gap-3 mb-4">
                         <Avatar className="h-9 w-9">
                            <AvatarImage src={user?.photoURL ?? ""} alt={user?.displayName ?? ""} />
                            <AvatarFallback>{userInitials}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                           <p className="text-sm font-medium truncate">{user?.displayName}</p>
                           <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        </div>
                    </div>
                     <Button variant="ghost" className="w-full justify-start" asChild>
                        <Link href="/">
                             <ArrowLeft className="mr-2 h-4 w-4" /> Back to Main Site
                        </Link>
                     </Button>
                    <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={logout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </div>
        </div>
    );
}
