
import AdminSidebar from '@/components/admin/admin-sidebar';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
