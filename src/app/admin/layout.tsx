
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
            <div className="hidden w-64 flex-col border-r bg-background md:flex">
                <div className="flex flex-col gap-2 p-4">
                     <Skeleton className="h-9 w-32 mb-4" />
                     <div className="flex-1 space-y-2">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <Skeleton key={i} className="h-9 w-full" />
                        ))}
                     </div>
                </div>
                 <div className="mt-auto p-4">
                    <Skeleton className="h-9 w-full" />
                </div>
            </div>
            {/* Main Content Skeleton */}
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 flex-1">
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
     <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <AdminSidebar />
      <div className="flex flex-col">
        <AdminHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40">
            {children}
        </main>
      </div>
    </div>
  );
}
