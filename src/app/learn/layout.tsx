
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import LearnSidebar from '@/components/learn/sidebar';
import { Skeleton } from '@/components/ui/skeleton';

function LearnLayoutSkeleton() {
    return (
        <div className="flex min-h-screen w-full bg-muted/40">
            <div className="hidden border-r bg-background md:block w-64">
                 <div className="flex h-full max-h-screen flex-col gap-2 p-4">
                    <Skeleton className="h-8 w-32 mb-4" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-9 w-full" />
                        <Skeleton className="h-9 w-full" />
                        <Skeleton className="h-9 w-full" />
                    </div>
                </div>
            </div>
            <div className="flex flex-col flex-1">
                 <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
                    <Skeleton className="h-8 w-8 rounded-full" />
                 </header>
                 <main className="flex-1 overflow-auto p-4 sm:p-6">
                    <Skeleton className="h-96 w-full" />
                 </main>
            </div>
        </div>
    )
}


export default function LearnLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <LearnLayoutSkeleton />;
  }
  
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <LearnSidebar />
      <div className="flex flex-col">
        {/* We can add a header here later if needed */}
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40">
            {children}
        </main>
      </div>
    </div>
  );
}
