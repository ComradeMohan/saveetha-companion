
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import AdminSidebar from '@/components/admin/admin-sidebar';
import AdminHeader from '@/components/admin/admin-header';
import { Skeleton } from '@/components/ui/skeleton';

function AdminLayoutSkeleton() {
    return (
        <div className="flex min-h-screen w-full bg-muted/40">
            {/* Sidebar Skeleton */}
            <div className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex lg:w-56">
                <div className="flex flex-col items-center gap-4 px-2 sm:py-5 lg:items-start lg:px-4">
                     <Skeleton className="h-9 w-9 shrink-0 rounded-full md:h-8 md:w-8 lg:h-9 lg:w-auto lg:px-3 lg:py-2 lg:self-stretch" />
                     {Array.from({ length: 10 }).map((_, i) => (
                        <Skeleton key={i} className="h-9 w-9 rounded-lg md:h-8 md:w-8 lg:h-9 lg:w-full" />
                     ))}
                </div>
                 <div className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5 lg:items-start lg:px-4">
                    <Skeleton className="h-9 w-9 rounded-lg md:h-8 md:w-8 lg:h-9 lg:w-full" />
                </div>
            </div>
            {/* Main Content Skeleton */}
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 lg:pl-56 flex-1">
                 <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                    <Skeleton className="h-8 w-32" />
                 </header>
                 <main className="flex-1 overflow-auto p-4 sm:p-6">
                    <Skeleton className="h-8 w-48 mb-4" />
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                        <Skeleton className="h-28" />
                        <Skeleton className="h-28" />
                        <Skeleton className="h-28" />
                        <Skeleton className="h-28" />
                    </div>
                     <Skeleton className="h-96 w-full" />
                 </main>
            </div>
        </div>
    )
}


export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, loading, router]);

  if (loading || !isAdmin) {
    return <AdminLayoutSkeleton />;
  }
  
  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <AdminSidebar />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 lg:pl-56 flex-1">
        <AdminHeader />
        <main className="flex-1 overflow-auto p-4 sm:p-0">{children}</main>
      </div>
    </div>
  );
}
