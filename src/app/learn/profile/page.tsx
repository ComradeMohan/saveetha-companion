
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Phone, CheckCircle2, Calculator, Building, School, Bot, Loader2 } from 'lucide-react';
import { RadialBarChart, RadialBar, PolarAngleAxis, LabelList } from 'recharts';
import { ChartConfig, ChartContainer } from '@/components/ui/chart';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { generateProfileDescription } from '@/ai/flows/profile-describer-flow';

interface CgpaData {
    cgpa: number;
    totalCredits: number;
}

function ProfilePageSkeleton() {
    return (
        <Card className="w-full">
            <CardHeader className="text-center p-6 md:p-8">
                 <Skeleton className="h-24 w-24 rounded-full mx-auto mb-4" />
                 <Skeleton className="h-8 w-48 mx-auto mb-2" />
                 <Skeleton className="h-4 w-64 mx-auto" />
            </CardHeader>
            <CardContent className="p-6 md:p-8 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                    <div className="md:col-span-1">
                        <Skeleton className="h-64 w-full" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default function ProfilePage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [cgpaData, setCgpaData] = useState<CgpaData | null>(null);
  const [loadingCgpa, setLoadingCgpa] = useState(true);
  const [aiDescription, setAiDescription] = useState<string>('');
  const [loadingDescription, setLoadingDescription] = useState(true);

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
  
   useEffect(() => {
    const fetchDescription = async () => {
        if (profile) {
            setLoadingDescription(true);
            try {
                const result = await generateProfileDescription({
                    name: profile.name,
                    college: profile.college,
                    department: profile.department,
                    cgpa: cgpaData?.cgpa,
                });
                setAiDescription(result.description);
            } catch (error) {
                console.error("Error generating AI description:", error);
                setAiDescription("A dedicated and passionate student focused on academic excellence.");
            } finally {
                setLoadingDescription(false);
            }
        }
    };

    // We only fetch the description once auth, profile, and CGPA data are all loaded.
    if (!authLoading && profile && !loadingCgpa) {
        fetchDescription();
    }

  }, [profile, cgpaData, authLoading, loadingCgpa]);

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
    <>
      <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold md:text-2xl">My Profile</h1>
      </div>
       <div className="mt-4">
        {isLoading ? <ProfilePageSkeleton /> : profile ? (
            <Card className="w-full">
                <CardHeader className="text-center bg-secondary/30 p-6 md:p-8 rounded-t-xl">
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

                <CardContent className="p-6 md:p-8">
                     <Card className="mb-6 bg-primary/5 border-primary/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Bot className="h-5 w-5 text-primary" /> AI Profile Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loadingDescription ? (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Generating your summary...</span>
                                </div>
                            ) : (
                                <p className="text-muted-foreground italic">{aiDescription}</p>
                            )}
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-4">
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                <div className="flex items-start gap-3 p-4 bg-secondary/50 rounded-lg">
                                    <School className="h-5 w-5 text-primary mt-1" />
                                    <div>
                                        <p className="font-semibold text-sm text-muted-foreground">Department</p>
                                        <p>{profile.department || 'Not Set'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-4 bg-secondary/50 rounded-lg">
                                    <Building className="h-5 w-5 text-primary mt-1" />
                                    <div>
                                        <p className="font-semibold text-sm text-muted-foreground">College</p>
                                        <p>{profile.college || 'Not Set'}</p>
                                    </div>
                                </div>
                             </div>
                        </div>
                        <div className="md:col-span-1">
                            {cgpaData ? (
                                <Card className="bg-secondary/30 text-center h-full flex flex-col justify-center">
                                    <CardHeader className="pb-0">
                                        <CardTitle className="text-lg">Your CGPA</CardTitle>
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
                                <div className="text-center py-6 px-4 border-2 border-dashed rounded-lg h-full flex flex-col items-center justify-center">
                                    <Calculator className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                                    <p className="font-semibold">No CGPA data found.</p>
                                    <p className="text-sm text-muted-foreground mb-4">Log your course grades to see your CGPA here.</p>
                                    <Button asChild>
                                        <Link href="/learn/courses">Go to Courses</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        ) : (
            <div className="text-center py-10">
                <p className="text-muted-foreground">Could not load profile information. Please try logging in again.</p>
            </div>
        )}
       </div>
    </>
  );
}
