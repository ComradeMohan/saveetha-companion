
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Phone, CheckCircle2, Calculator, Building, School, Bot, Loader2 } from 'lucide-react';
import { RadialBarChart, RadialBar, PolarAngleAxis, LabelList } from 'recharts';
import { ChartConfig, ChartContainer } from '@/components/ui/chart';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { generateProfileDescription } from '@/ai/flows/profile-describer-flow';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface CgpaData {
    cgpa: number;
    totalCredits: number;
}

const gradePoints: { [key: string]: number } = {
  S: 10, A: 9, B: 8, C: 7, D: 6, E: 5,
};

function ProfilePageSkeleton() {
    return (
        <Card className="w-full">
            <CardHeader className="text-center p-6">
                 <Skeleton className="h-24 w-24 rounded-full mx-auto mb-4" />
                 <Skeleton className="h-8 w-48 mx-auto mb-2" />
                 <Skeleton className="h-4 w-64 mx-auto" />
            </CardHeader>
            <CardContent className="p-6 pt-0">
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
    const fetchAndCalculateCgpa = async () => {
      if (!user) return;
      setLoadingCgpa(true);
      try {
        const gradesDocRef = doc(db, 'student_grades', user.uid);
        const gradesDocSnap = await getDoc(gradesDocRef);

        if (gradesDocSnap.exists()) {
            const grades = gradesDocSnap.data();
            let totalPoints = 0;
            let totalSubjects = 0;
            for (const courseCode in grades) {
                const grade = grades[courseCode];
                if (gradePoints[grade]) {
                    totalPoints += gradePoints[grade];
                    totalSubjects++;
                }
            }
            const totalCredits = totalSubjects * 4; // Assuming 4 credits per subject
            const cgpa = totalCredits > 0 ? (totalPoints * 4) / totalCredits : 0;

            setCgpaData({ cgpa, totalCredits });
        } else {
            setCgpaData(null);
        }
      } catch (error) {
        console.error("Error fetching/calculating CGPA data:", error);
      } finally {
        setLoadingCgpa(false);
      }
    };

    if (!authLoading) {
      fetchAndCalculateCgpa();
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
                <CardHeader className="text-center bg-secondary/30 p-6 rounded-t-xl">
                    <Avatar className="h-20 w-20 mx-auto mb-3 border-4 border-primary/50 shadow-lg">
                        <AvatarImage src={profile.photoURL} alt={profile.name} />
                        <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
                    </Avatar>
                    <h1 className="text-2xl font-bold">{profile.name}</h1>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <p>{profile.email}</p>
                        {profile.isVerified && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                    </div>
                </CardHeader>

                <CardContent className="p-6">
                     <Card className="mb-6 bg-primary/5 border-primary/20">
                        <CardHeader className="pb-2 pt-4">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Bot className="h-5 w-5 text-primary" /> AI Profile Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 pb-4">
                            {loadingDescription ? (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Generating your summary...</span>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">{aiDescription}</p>
                            )}
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-4">
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                                    <User className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="font-semibold text-xs text-muted-foreground">Registration No.</p>
                                        <p className="text-sm">{profile.regNo || 'Not Set'}</p>
                                    </div>
                                </div>
                                 <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                                    <Phone className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="font-semibold text-xs text-muted-foreground">Phone Number</p>
                                        <p className="text-sm">{profile.phone || 'Not Set'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                                    <School className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="font-semibold text-xs text-muted-foreground">Department</p>
                                        <p className="text-sm">{profile.department || 'Not Set'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                                    <Building className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="font-semibold text-xs text-muted-foreground">College</p>
                                        <p className="text-sm">{profile.college || 'Not Set'}</p>
                                    </div>
                                </div>
                             </div>
                        </div>
                        <div className="md:col-span-1">
                            {cgpaData ? (
                                <Card className="bg-secondary/30 text-center h-full flex flex-col justify-center items-center">
                                    <CardHeader className="p-2 pt-4">
                                        <CardTitle className="text-base">Your CGPA</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-1 flex items-center justify-center p-0">
                                        <ChartContainer
                                            config={chartConfig}
                                            className="mx-auto aspect-square h-40 w-40"
                                        >
                                            <RadialBarChart data={chartData} startAngle={-270} endAngle={90} innerRadius="70%" outerRadius="100%" barSize={20}>
                                                <PolarAngleAxis type="number" domain={[0, 100]} dataKey="value" tick={false}/>
                                                <RadialBar dataKey="value" background cornerRadius={10} className="fill-primary">
                                                    <LabelList position="center" content={({ viewBox }) => {
                                                        if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                                                        return (
                                                            <>
                                                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                                                <tspan className="fill-foreground text-3xl font-bold tabular-nums">{cgpaData.cgpa.toFixed(2)}</tspan>
                                                            </text>
                                                            <text x={viewBox.cx} y={(viewBox.cy || 0) + 16} textAnchor="middle" dominantBaseline="middle">
                                                                <tspan className="fill-muted-foreground text-xs">out of 10</tspan>
                                                            </text>
                                                            </>
                                                        )}
                                                        return null;
                                                    }}/>
                                                </RadialBar>
                                            </RadialBarChart>
                                        </ChartContainer>
                                    </CardContent>
                                    <CardFooter className="text-xs text-muted-foreground justify-center p-2 pb-3">
                                        <p>Based on {cgpaData.totalCredits} credits.</p>
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
