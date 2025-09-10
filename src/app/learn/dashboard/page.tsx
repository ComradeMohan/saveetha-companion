
'use client';

import { useAuth } from '@/hooks/use-auth';
import useStudentDashboard from '@/hooks/use-student-dashboard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, Book, Search, Briefcase, Bot, ArrowRight, BookOpen, Clock4, Scan } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-48" />
                 <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <Skeleton className="h-9 w-20 rounded-md" />
                </div>
            </div>
             <Skeleton className="h-20 w-full rounded-lg" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Skeleton className="lg:col-span-2 h-48 w-full" />
                <Skeleton className="lg:col-span-1 h-48 w-full" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Skeleton className="lg:col-span-1 h-48 w-full" />
                <Skeleton className="lg:col-span-2 h-48 w-full" />
            </div>
        </div>
    )
}


export default function StudentDashboardPage() {
    const { user, profile, loading: authLoading } = useAuth();
    const { data, loading: dataLoading } = useStudentDashboard();

    const loading = authLoading || dataLoading;

    if (loading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold">
                    Hello, <span className="text-primary">{profile?.name.split(' ')[0] || 'Student'}</span>
                </h1>
            </div>

            <Card className="bg-primary/10 border-primary/20">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                     <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={user?.photoURL || ''} alt={profile?.name}/>
                            <AvatarFallback>{profile?.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{profile?.name}</p>
                            <p className="text-sm text-muted-foreground">{profile?.department || 'Student'}</p>
                        </div>
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
                        <div className="relative h-28 w-28 flex-shrink-0">
                            <div className="absolute inset-0 flex items-center justify-center">
                                 <div className="h-full w-full rounded-lg border-2 border-dashed flex items-center justify-center">
                                     <span className="text-3xl font-bold">{data.progressPercentage.toFixed(0)}%</span>
                                 </div>
                            </div>
                        </div>
                        <div className="flex-1 w-full space-y-4">
                             <div className="flex flex-wrap items-center gap-4 text-sm">
                                <Badge variant="secondary">GPA: {data.cgpa.toFixed(2)}</Badge>
                                 <p className="text-muted-foreground">
                                    {data.completedCoursesCount} of {data.totalCourses} core courses completed
                                </p>
                             </div>
                            <Progress value={data.progressPercentage} className="h-2" />
                        </div>
                    </CardContent>
                </Card>
                
                 <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Jump right back into your work.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                           <div className="flex items-center gap-3">
                                <div className="p-2 bg-background rounded-md">
                                    <Scan className="h-5 w-5 text-primary"/>
                                </div>
                                <div>
                                    <p className="font-semibold">Review Roadmap</p>
                                    <p className="text-xs text-muted-foreground">Check your course progression</p>
                                </div>
                           </div>
                           <Button size="sm" asChild>
                                <Link href="/learn">
                                    View
                                </Link>
                           </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Study Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-primary/5 rounded-lg flex items-start justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground">Total Time Spent</p>
                                <p className="text-2xl font-bold">--</p>
                            </div>
                            <Clock4 className="h-4 w-4 text-muted-foreground"/>
                        </div>
                         <div className="p-4 bg-primary/5 rounded-lg flex items-start justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground">Core Courses</p>
                                <p className="text-2xl font-bold">{data.totalCourses}</p>
                            </div>
                            <BookOpen className="h-4 w-4 text-muted-foreground"/>
                        </div>
                    </CardContent>
                </Card>

                 <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Manage activities as you engage with courses.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="p-4 text-center bg-primary/5 rounded-lg text-sm text-muted-foreground">
                            Activity tracking is not yet available.
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                           <div className="relative flex-1">
                             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                             <Input placeholder="Search saved courses..." className="pl-8" disabled />
                           </div>
                           <Button variant="secondary" disabled>Manage</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
