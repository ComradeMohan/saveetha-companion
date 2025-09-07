
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Phone, CheckCircle2, Calculator } from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { RadialBarChart, RadialBar, PolarAngleAxis, LabelList } from 'recharts';
import { ChartConfig, ChartContainer } from '@/components/ui/chart';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface CgpaData {
    cgpa: number;
    totalCredits: number;
}

function ProfilePageSkeleton() {
    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center p-8">
                 <Skeleton className="h-24 w-24 rounded-full mx-auto mb-4" />
                 <Skeleton className="h-8 w-48 mx-auto mb-2" />
                 <Skeleton className="h-4 w-64 mx-auto" />
            </CardHeader>
            <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                </div>
                <div>
                    <Skeleton className="h-48 w-full" />
                </div>
            </CardContent>
        </Card>
    )
}

export default function ProfilePage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [cgpaData, setCgpaData] = useState<CgpaData | null>(null);
  const [loadingCgpa, setLoadingCgpa] = useState(true);

  useEffect(() => {
    const fetchCgpaData = async () => {
      if (user) {
        setLoadingCgpa(true);
        try {
          const { getDoc, doc } = await import('firebase/firestore');
          const { db } = await import('@/lib/firebase');
          const cgpaDocRef = doc(db, 'students_cgpa', user.uid);
          const cgpaDocSnap = await getDoc(cgpaDocRef);

          if (cgpaDocSnap.exists()) {
            setCgpaData(cgpaDocSnap.data() as CgpaData);
          }
        } catch (error) {
          console.error("Error fetching CGPA data:", error);
        } finally {
          setLoadingCgpa(false);
        }
      }
    };

    if (!authLoading) {
        fetchCgpaData();
    }
  }, [user, authLoading]);

  const userInitials = profile?.name ? profile.name.slice(0, 2).toUpperCase() : '?';

  const chartData = cgpaData ? [{ name: 'CGPA', value: cgpaData.cgpa * 10, fill: 'var(--color-value)' }] : [];
  const chartConfig = {
    value: {
      label: 'CGPA',
      color: 'hsl(var(--primary))',
    },
  } satisfies ChartConfig;

  const isLoading = authLoading || loadingCgpa;

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
        <Header />
        <main className="flex-1 pt-20 pb-12 md:py-16">
            <div className="container mx-auto px-4">
                {isLoading ? <ProfilePageSkeleton /> : profile ? (
                    <Card className="max-w-2xl mx-auto shadow-xl">
                        <CardHeader className="text-center bg-secondary/30 p-8 rounded-t-xl">
                            <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-primary/50 shadow-lg">
                                <AvatarImage src={profile.photoURL} alt={profile.name} />
                                <AvatarFallback className="text-3xl">{userInitials}</AvatarFallback>
                            </Avatar>
                            <h1 className="text-3xl font-bold">{profile.name}</h1>
                            <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                <p>{profile.email}</p>
                                {profile.isVerified && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="flex items-start gap-3 p-4 bg-secondary/50 rounded-lg">
                                    <User className="h-5 w-5 text-primary mt-1" />
                                    <div>
                                        <p className="font-semibold text-sm text-muted-foreground">Registration No.</p>
                                        <p>{profile.regNo || 'Not Set'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-4 bg-secondary/50 rounded-lg">
                                    <Phone className="h-5 w-5 text-primary mt-1" />
                                    <div>
                                        <p className="font-semibold text-sm text-muted-foreground">Phone Number</p>
                                        <p>{profile.phone || 'Not Set'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="md:col-span-1">
                                {cgpaData ? (
                                    <Card className="bg-secondary/30 text-center h-full flex flex-col justify-center">
                                        <CardHeader className="pb-0">
                                            <CardTitle>Your CGPA</CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex items-center justify-center p-0">
                                            <ChartContainer
                                                config={chartConfig}
                                                className="mx-auto aspect-square h-48 w-48"
                                            >
                                                <RadialBarChart data={chartData} startAngle={-270} endAngle={90} innerRadius="70%" outerRadius="100%" barSize={20}>
                                                    <PolarAngleAxis type="number" domain={[0, 100]} dataKey="value" tick={false}/>
                                                    <RadialBar dataKey="value" background cornerRadius={10} className="fill-primary">
                                                        <LabelList position="center" content={({ viewBox }) => {
                                                            if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                                                            return (
                                                                <>
                                                                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                                                    <tspan className="fill-foreground text-4xl font-bold tabular-nums">{cgpaData.cgpa.toFixed(2)}</tspan>
                                                                </text>
                                                                <text x={viewBox.cx} y={(viewBox.cy || 0) + 20} textAnchor="middle" dominantBaseline="middle">
                                                                    <tspan className="fill-muted-foreground text-sm">out of 10</tspan>
                                                                </text>
                                                                </>
                                                            )}
                                                            return null;
                                                        }}/>
                                                    </RadialBar>
                                                </RadialBarChart>
                                            </ChartContainer>
                                        </CardContent>
                                        <CardFooter className="text-center text-sm text-muted-foreground justify-center pt-2 pb-4">
                                            <p>Based on {cgpaData.totalCredits} total credits.</p>
                                        </CardFooter>
                                    </Card>
                                ) : (
                                    <div className="text-center py-10 px-4 border-2 border-dashed rounded-lg h-full flex flex-col items-center justify-center">
                                        <Calculator className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                                        <p className="font-semibold">No CGPA data found.</p>
                                        <p className="text-sm text-muted-foreground mb-4">Calculate and save your CGPA to see it here.</p>
                                        <Button asChild>
                                            <Link href="/#calculators">Go to Calculator</Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-muted-foreground">Could not load profile information. Please try logging in again.</p>
                    </div>
                )}
            </div>
        </main>
        <Footer />
    </div>
  );
}
