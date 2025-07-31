
'use client';

import { useAuth } from '@/hooks/use-auth';
import useDashboardData from '@/hooks/use-dashboard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { ArrowRight, Bell, Calendar, Calculator, Book, Users, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';
import { formatDistanceToNow, format } from 'date-fns';

function StatCardSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-5 w-3/4 mb-1" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-10 w-1/2" />
            </CardContent>
        </Card>
    );
}

export default function Dashboard() {
    const { user } = useAuth();
    const { data, loading } = useDashboardData();

    const quickLinks = [
        { href: '/#calculators', label: 'Calculators', icon: Calculator },
        { href: '/#concepts', label: 'Concept Maps', icon: Lightbulb },
        { href: '/#faculty', label: 'Faculty Directory', icon: Users },
        { href: '/calendar', label: 'Events Calendar', icon: Calendar },
    ];

    return (
        <section className="py-12 md:py-16 lg:pt-24 lg:pb-16 animate-fade-in">
            <div className="container mx-auto px-4">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Welcome back, {user?.displayName?.split(' ')[0] || 'Student'}!
                    </h1>
                    <p className="text-muted-foreground mt-1">Here's your academic snapshot for today.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Column 1: CGPA and Countdown */}
                    <div className="space-y-6">
                        {loading ? (
                            <StatCardSkeleton />
                        ) : (
                            <Card className="h-full">
                                <CardHeader>
                                    <CardTitle>Your CGPA</CardTitle>
                                    <CardDescription>Current calculated average</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {data.cgpa ? (
                                        <>
                                            <p className="text-5xl font-bold text-primary">{data.cgpa.cgpa.toFixed(2)}</p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Based on {data.cgpa.totalCredits} credits
                                            </p>
                                        </>
                                    ) : (
                                        <div className="text-center py-4">
                                            <p className="text-muted-foreground text-sm mb-2">No CGPA data found.</p>
                                            <Button asChild variant="secondary" size="sm">
                                                <Link href="/#calculators">Go to Calculator</Link>
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                        {loading ? (
                            <StatCardSkeleton />
                        ) : (
                             <Card className="h-full">
                                <CardHeader>
                                    <CardTitle>Next Event</CardTitle>
                                    <CardDescription>{data.nextEvent ? data.nextEvent.title : 'No upcoming events'}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {data.nextEvent ? (
                                        <>
                                            <p className="text-5xl font-bold text-primary">{data.daysUntilNextEvent}</p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {data.daysUntilNextEvent === 1 ? 'day remaining' : 'days remaining'} until {format(new Date(data.nextEvent.startDate), 'MMM d')}
                                            </p>
                                        </>
                                    ) : (
                                        <div className="text-center py-4">
                                            <p className="text-muted-foreground text-sm mb-2">Check the calendar for details.</p>
                                            <Button asChild variant="secondary" size="sm">
                                                <Link href="/calendar">View Calendar</Link>
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Column 2: Announcements */}
                    <div className="lg:col-span-1">
                         <Card className="h-full">
                            <CardHeader>
                                <CardTitle>Recent Announcements</CardTitle>
                                <CardDescription>Latest news and updates</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="space-y-4">
                                        <Skeleton className="h-16 w-full" />
                                        <Skeleton className="h-16 w-full" />
                                        <Skeleton className="h-16 w-full" />
                                    </div>
                                ) : data.updates.length > 0 ? (
                                    <div className="space-y-4">
                                        {data.updates.map(update => (
                                            <div key={update.id} className="flex items-start gap-3">
                                                <div className="p-2 bg-secondary rounded-lg mt-1">
                                                    <Bell className="h-4 w-4 text-secondary-foreground" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm">{update.title}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatDistanceToNow(update.createdAt.toDate(), { addSuffix: true })}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                         <Button asChild variant="outline" className="w-full mt-4">
                                            <Link href="/updates">View All Updates <ArrowRight className="ml-2 h-4 w-4" /></Link>
                                        </Button>
                                    </div>
                                ) : (
                                    <p className="text-center text-muted-foreground py-10">No recent announcements.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Column 3: Quick Links */}
                    <div className="lg:col-span-1">
                         <Card className="h-full">
                            <CardHeader>
                                <CardTitle>Quick Links</CardTitle>
                                <CardDescription>Access popular features</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-4">
                                {quickLinks.map(link => (
                                    <Link key={link.href} href={link.href} className="group">
                                        <div className="flex flex-col items-center justify-center text-center p-4 bg-secondary/50 rounded-lg h-full transition-colors hover:bg-primary/10">
                                            <link.icon className="h-8 w-8 text-primary mb-2 transition-transform group-hover:scale-110" />
                                            <p className="text-sm font-medium">{link.label}</p>
                                        </div>
                                    </Link>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </section>
    );
}
