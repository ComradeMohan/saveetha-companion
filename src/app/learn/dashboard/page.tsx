
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
                <Skeleton className="h-10 w-24" />
            </div>
            <Skeleton className="h-24 w-full" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Skeleton className="h-48 w-full" />
                </div>
                <Skeleton className="h-48 w-full" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
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
                 <div className="flex items-center gap-2">
                    <Button variant="outline">Edit Status</Button>
                </div>
            </div>

            <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4 flex items-center gap-4">
                    <img src={user?.photoURL || ''} alt="User" className="h-12 w-12 rounded-full" />
                    <div>
                        <p className="font-semibold">{profile?.name}</p>
                        <p className="text-sm text-muted-foreground">I am testing this qapp for the mobile application</p>
                    </div>
                </CardContent>
            </Card>

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
                        <div className="flex-1 space-y-2">
                            <div className="flex justify-between">
                                <Badge variant="secondary">{data.creditsCompleted}/135 credits</Badge>
                                <Badge variant="secondary">GPA: {data.cgpa.toFixed(2)}</Badge>
                            </div>
                            <Progress value={data.progressPercentage} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Continue Studying</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-background rounded-md">
                                <Bot className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="font-semibold">Artificial Intelligence</p>
                                <p className="text-xs text-muted-foreground">MASTER Mode</p>
                            </div>
                        </div>
                        <Button>Resume</Button>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Study Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg">
                            <Clock className="h-6 w-6 text-primary" />
                            <div>
                                <p className="text-xs text-muted-foreground">Total Time Spent</p>
                                <p className="text-lg font-bold">42h 30m</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg">
                            <Book className="h-6 w-6 text-primary" />
                            <div>
                                <p className="text-xs text-muted-foreground">Total Courses</p>
                                <p className="text-lg font-bold">{data.totalCourses}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                 <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="text-center p-4 bg-destructive/10 text-destructive-foreground rounded-lg">
                            <p className="text-sm">No recent activity to show</p>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <input placeholder="Found saved course" className="pl-8 w-full bg-background border border-border h-9 rounded-md px-3 text-sm"/>
                            </div>
                            <Button>Manage</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
