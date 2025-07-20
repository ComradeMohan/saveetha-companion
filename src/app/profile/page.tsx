
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, User, Mail, Hash, Phone, CheckCircle2, Calculator } from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface UserProfile {
  name: string;
  email: string;
  regNo: string;
  phone: string;
  isVerified: boolean;
  photoURL?: string;
}

interface CgpaData {
    cgpa: number;
    totalCredits: number;
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [cgpaData, setCgpaData] = useState<CgpaData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (user) {
        try {
          // Fetch user profile
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setProfile({
                name: data.name || user.displayName || 'N/A',
                email: data.email || user.email || 'N/A',
                regNo: data.regNo || 'N/A',
                phone: data.phone || 'N/A',
                isVerified: user.emailVerified,
                photoURL: user.photoURL ?? '',
            });
          }

          // Fetch CGPA data
          const cgpaDocRef = doc(db, 'students_cgpa', user.uid);
          const cgpaDocSnap = await getDoc(cgpaDocRef);

          if (cgpaDocSnap.exists()) {
            setCgpaData(cgpaDocSnap.data() as CgpaData);
          }

        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (!authLoading) {
        fetchProfileData();
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

  return (
    <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 py-12 md:py-20">
            <div className="container mx-auto px-4">
                <Card className="max-w-2xl mx-auto shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl">Your Profile</CardTitle>
                        <CardDescription>View your personal information and academic progress.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading || authLoading ? (
                            <div className="flex justify-center items-center py-10">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : profile ? (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-20 w-20">
                                        <AvatarImage src={profile.photoURL} alt={profile.name} />
                                        <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h2 className="text-2xl font-bold">{profile.name}</h2>
                                        <div className="flex items-center gap-2">
                                            <p className="text-muted-foreground">{profile.email}</p>
                                            {profile.isVerified && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                                        <User className="h-5 w-5 text-primary" />
                                        <div>
                                            <p className="font-semibold">Registration No.</p>
                                            <p className="text-muted-foreground">{profile.regNo}</p>
                                        </div>
                                    </div>
                                     <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                                        <Phone className="h-5 w-5 text-primary" />
                                        <div>
                                            <p className="font-semibold">Phone Number</p>
                                            <p className="text-muted-foreground">{profile.phone}</p>
                                        </div>
                                    </div>
                                </div>
                                {cgpaData ? (
                                    <Card className="bg-secondary/30">
                                        <CardHeader>
                                            <CardTitle className="text-lg">Your CGPA</CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex items-center justify-center p-0">
                                            <ChartContainer
                                                config={chartConfig}
                                                className="mx-auto aspect-square h-48 w-48"
                                            >
                                                <RadialBarChart
                                                    data={chartData}
                                                    startAngle={-270}
                                                    endAngle={90}
                                                    innerRadius="70%"
                                                    outerRadius="100%"
                                                    barSize={20}
                                                >
                                                    <PolarAngleAxis
                                                        type="number"
                                                        domain={[0, 100]}
                                                        dataKey="value"
                                                        tick={false}
                                                    />
                                                    <RadialBar
                                                        dataKey="value"
                                                        background
                                                        cornerRadius={10}
                                                        className="fill-primary"
                                                    >
                                                        <RechartsPrimitive.LabelList
                                                            position="center"
                                                            content={({ viewBox }) => {
                                                                if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                                                                return (
                                                                    <>
                                                                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                                                                        <tspan
                                                                        x={viewBox.cx}
                                                                        y={viewBox.cy}
                                                                        className="text-4xl font-bold text-primary tabular-nums"
                                                                        >
                                                                        {cgpaData.cgpa.toFixed(2)}
                                                                        </tspan>
                                                                    </text>
                                                                    <text x={viewBox.cx} y={(viewBox.cy || 0) + 20} textAnchor="middle">
                                                                        <tspan
                                                                        x={viewBox.cx}
                                                                        y={(viewBox.cy || 0) + 20}
                                                                        className="text-sm text-muted-foreground"
                                                                        >
                                                                        out of 10
                                                                        </tspan>
                                                                    </text>
                                                                    </>
                                                                )
                                                                }
                                                                return null;
                                                            }}
                                                        />
                                                    </RadialBar>
                                                </RadialBarChart>
                                            </ChartContainer>
                                        </CardContent>
                                        <CardFooter className="text-center text-sm text-muted-foreground justify-center pt-6">
                                            <p>Based on {cgpaData.totalCredits} total credits.</p>
                                        </CardFooter>
                                    </Card>
                                ) : (
                                    <div className="text-center py-6 px-4 border-2 border-dashed rounded-lg">
                                        <Calculator className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                                        <p className="font-semibold">No CGPA data found.</p>
                                        <p className="text-sm text-muted-foreground mb-4">Calculate and save your CGPA to see it here.</p>
                                        <Button asChild>
                                            <Link href="/#calculators">Go to Calculator</Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-muted-foreground">Could not load profile information.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
        <Footer />
    </div>
  );
}
