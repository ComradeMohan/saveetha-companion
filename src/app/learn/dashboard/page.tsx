
'use client';

import { useAuth } from '@/hooks/use-auth';
import useStudentDashboard from '@/hooks/use-student-dashboard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, Book, Search, Briefcase, Bot } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-48" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Skeleton className="h-48 w-full" />
                </div>
                <div className="lg:col-span-1">
                    <Skeleton className="h-48 w-full" />
                </div>
            </div>
        </div>
    )
}


export default function StudentDashboardPage() {
    const { user, profile } = useAuth();
    const { data, loading } = useStudentDashboard();

    if (loading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Hello, {profile?.name.split(' ')[0] || 'Student'}</h1>
                    <p className="text-muted-foreground">Here's your academic and career snapshot.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Degree Progress</CardTitle>
                        <CardDescription>Bachelor of Technology, {profile?.department}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative h-32 w-32">
                             <Progress value={data.progressPercentage} className="h-full w-full rounded-full" />
                              <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
                                {data.progressPercentage.toFixed(0)}%
                            </div>
                        </div>
                        <div className="flex-1 space-y-2 w-full">
                            <div className="flex justify-between">
                                <Badge variant="secondary">{data.totalCourses} courses logged</Badge>
                                <Badge variant="secondary">GPA: {data.cgpa.toFixed(2)}</Badge>
                            </div>
                            <Progress value={data.progressPercentage} />
                        </div>
                    </CardContent>
                </Card>
                
                 <Card>
                    <CardHeader>
                        <CardTitle>Your Profile</CardTitle>
                        <CardDescription>A summary of your academic profile.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center gap-4">
                         <img src={user?.photoURL || ''} alt="User" className="h-12 w-12 rounded-full" />
                        <div>
                            <p className="font-semibold">{profile?.name}</p>
                            <p className="text-sm text-muted-foreground">{profile?.email}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
