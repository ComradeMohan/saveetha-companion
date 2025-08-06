
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import AdminSidebar from '@/components/admin/admin-sidebar';
import AdminHeader from '@/components/admin/admin-header';
import LoadingAnimation from '@/components/loading-animation';

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
    return (
       <div className="flex h-screen w-full items-center justify-center">
        <LoadingAnimation />
      </div>
    );
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
