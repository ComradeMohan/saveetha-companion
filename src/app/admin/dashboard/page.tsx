
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpen, Users, MessageSquare } from 'lucide-react';
import useDashboardStats from '@/hooks/use-dashboard-stats';
import { Skeleton } from '@/components/ui/skeleton';
import RecentSignups from '@/components/admin/recent-signups';

function StatCard({ title, value, icon: Icon, description, loading }: { title: string, value: number | string, icon: React.ElementType, description: string, loading: boolean }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <>
            <Skeleton className="h-8 w-1/2 mb-1" />
            <Skeleton className="h-4 w-full" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { stats, loading } = useDashboardStats();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.count}
          description={`${stats.totalUsers.newToday > 0 ? `+${stats.totalUsers.newToday}` : 'No new users'} today`}
          icon={Users}
          loading={loading}
        />
        <StatCard
          title="Faculty Members"
          value={stats.facultyCount}
          description="Total faculty in directory"
          icon={Users}
          loading={loading}
        />
        <StatCard
          title="Concept Maps"
          value={stats.conceptMaps}
          description="Total maps available"
          icon={BookOpen}
          loading={loading}
        />
        <StatCard
          title="Contact Messages"
          value={stats.unreadMessages}
          description="Unread messages"
          icon={MessageSquare}
          loading={loading}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-full">
            <CardHeader>
                <CardTitle>Recent Signups</CardTitle>
                <CardDescription>A chart of new users over the last 30 days.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <RecentSignups userList={stats.userList} loading={loading} />
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
