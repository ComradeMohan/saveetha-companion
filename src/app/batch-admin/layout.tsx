
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import AdminHeader from '@/components/admin/admin-header';
import { GraduationCap, Megaphone } from 'lucide-react';
import Link from 'next/link';

function BatchAdminLayoutSkeleton() {
    return (
        <div className="flex min-h-screen w-full bg-muted/40">
            <div className="flex flex-col flex-1">
                 <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                    <Skeleton className="h-8 w-32" />
                 </header>
                 <main className="flex-1 overflow-auto p-4 sm:p-6">
                    <Skeleton className="h-8 w-48 mb-4" />
                    <Skeleton className="h-96 w-full" />
                 </main>
            </div>
        </div>
    )
}

function Sidebar() {
    return (
        <div className="hidden border-r bg-background md:block">
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                     <Link href="/" className="flex items-center gap-2 font-semibold">
                        <GraduationCap className="h-6 w-6 text-primary" />
                        <span>Batch Admin</span>
                    </Link>
                </div>
                <div className="flex-1">
                    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                         <Link
                            href="/batch-admin"
                            className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary"
                            >
                            <Megaphone className="h-4 w-4" />
                            Send Notification
                        </Link>
                    </nav>
                </div>
            </div>
        </div>
    )
}


export default function BatchAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isBatchAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isBatchAdmin) {
      router.push('/');
    }
  }, [isBatchAdmin, loading, router]);

  if (loading || !isBatchAdmin) {
    return <BatchAdminLayoutSkeleton />;
  }
  
  return (
     <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <AdminHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40">
            {children}
        </main>
      </div>
    </div>
  );
}
