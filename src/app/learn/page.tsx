
'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, GitBranch, CheckCircle, Loader2, Trophy } from "lucide-react";
import { getCourses } from '@/app/actions/manage-courses';
import { arrangeRoadmap } from '@/ai/flows/roadmap-arranger-flow';
import type { Course, Stage } from '@/lib/roadmap-arranger-types';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';


type StudentGrades = {
  [courseCode: string]: string;
};

function RoadmapSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-7 w-1/2" />
                <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
               <div className="relative pl-6 after:absolute after:inset-y-0 after:w-px after:bg-muted-foreground/20 after:left-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                         <div key={i} className="grid gap-10 mb-10">
                            <div className="grid grid-cols-[40px_1fr] items-start gap-4">
                                <Skeleton className="h-10 w-10 rounded-full -ml-5" />
                                <div className="pt-2">
                                     <Skeleton className="h-6 w-1/3" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pl-4 md:pl-14">
                                {Array.from({ length: 4 }).map((_, j) => (
                                    <Skeleton key={j} className="h-16 w-full" />
                                ))}
                            </div>
                        </div>
                    ))}
               </div>
            </CardContent>
        </Card>
    );
}

export default function LearnHomePage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [studentGrades, setStudentGrades] = useState<StudentGrades>({});
  const [roadmapData, setRoadmapData] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [roadmapLoading, setRoadmapLoading] = useState(true);

  useEffect(() => {
    const fetchRoadmap = async () => {
        if (!authLoading && profile?.college && profile?.department) {
            setRoadmapLoading(true);
            const cacheKey = `roadmapData-${profile.college}-${profile.department}`;
            try {
                 const cachedRoadmap = localStorage.getItem(cacheKey);
                 if (cachedRoadmap) {
                    setRoadmapData(JSON.parse(cachedRoadmap));
                 } else {
                    const courses = await getCourses(profile.college, profile.department) as Course[];
                    if(courses.length > 0) {
                        const result = await arrangeRoadmap({ courses });
                        setRoadmapData(result.stages);
                        localStorage.setItem(cacheKey, JSON.stringify(result.stages));
                    }
                }
            } catch (error) {
                console.error("Error fetching or arranging roadmap:", error);
            } finally {
                setRoadmapLoading(false);
            }
        } else if (!authLoading) {
            setRoadmapLoading(false);
        }
    };
    fetchRoadmap();
  }, [profile, authLoading]);
  
  useEffect(() => {
    if (authLoading || !user) {
        if (!authLoading) setLoading(false);
        return;
    }

    const docRef = doc(db, 'student_grades', user.uid);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
        setStudentGrades(docSnap.exists() ? docSnap.data() : {});
        setLoading(false);
    }, (error) => {
        console.error("Error fetching grades for roadmap:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading]);

  const completedCourseCodes = useMemo(() => new Set(Object.keys(studentGrades)), [studentGrades]);

  const { totalCourses, progressPercentage } = useMemo(() => {
    const total = roadmapData.reduce((acc, stage) => acc + stage.courses.length, 0);
    const completedCount = completedCourseCodes.size;
    const percentage = total > 0 ? (completedCount / total) * 100 : 0;
    return { totalCourses: total, progressPercentage: percentage };
  }, [roadmapData, completedCourseCodes]);

  if (loading || authLoading) {
      return (
           <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-8">
              <Loader2 className="h-10 w-10 animate-spin text-primary"/>
          </div>
      )
  }
  
  if (!profile?.college || !profile?.department) {
      return (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-8 text-center">
              <div>
                <h3 className="text-xl font-semibold">Profile Incomplete</h3>
                <p className="text-muted-foreground mt-2">Please complete your profile from the main site to view your roadmap.</p>
              </div>
          </div>
      )
  }

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Course Roadmap</h1>
      </div>
      
       <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Trophy className="text-amber-500"/> Progress Overview</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between mb-2">
                    <p className="text-muted-foreground text-sm">{completedCourseCodes.size} of {totalCourses} courses completed</p>
                    <p className="font-bold text-primary">{Math.round(progressPercentage)}%</p>
                </div>
                <Progress value={progressPercentage} className="h-3"/>
            </CardContent>
        </Card>

      {roadmapLoading ? <RoadmapSkeleton /> : (
        <Card>
            <CardHeader>
                <CardTitle>Your AI-Generated Academic Journey</CardTitle>
                <CardDescription>
                    A recommended roadmap for {profile.department} at {profile.college}. Courses disappear from here once you log a grade for them in the 'My Courses' tab.
                </CardDescription>
            </CardHeader>
            <CardContent>
            <div className="relative pl-6 after:absolute after:inset-y-0 after:w-px after:bg-muted-foreground/20 after:left-6">
                {roadmapData.length > 0 ? (
                    roadmapData.map((stage) => {
                        const remainingCourses = stage.courses.filter(course => !completedCourseCodes.has(course.id));
                        if (remainingCourses.length === 0) return null;

                        return (
                        <div key={stage.name} className="grid gap-10 mb-10">
                            <div className="grid grid-cols-[40px_1fr] items-start gap-4">
                                <div className="flex-shrink-0">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-primary/10 -ml-5 relative z-10">
                                    <GitBranch className="h-5 w-5 text-primary" />
                                    </span>
                                </div>
                                <div className="pt-2">
                                    <h3 className="text-lg font-semibold">{stage.name}</h3>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pl-4 md:pl-14">
                                {remainingCourses.map(course => (
                                    <Link key={course.id} href={`/learn/course/${course.id}`} className="group">
                                        <div className="flex items-start gap-3 p-3 rounded-lg border bg-secondary/30 h-full transition-all hover:bg-secondary/60 hover:border-primary/50">
                                            <Book className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold group-hover:text-primary transition-colors">{course.name}</p>
                                                <p className="text-sm text-muted-foreground">{course.id}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                        )
                    })
                ) : (
                    <div className="pl-4 md:pl-14 text-muted-foreground">No courses found for your department. An admin needs to add them.</div>
                )}
                <div className="grid grid-cols-[40px_1fr] items-start gap-4">
                    <div className="flex-shrink-0">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-green-500 bg-green-500/10 -ml-5 relative z-10">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                        </span>
                    </div>
                    <div className="pt-2">
                        <h3 className="text-lg font-semibold">End of Roadmap</h3>
                        <p className="text-muted-foreground">Log grades in 'My Courses' to see your progress.</p>
                    </div>
                </div>
            </div>
            </CardContent>
        </Card>
      )}
    </>
  )
}
