
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCourses } from '@/app/actions/manage-courses';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Loader2 } from 'lucide-react';

type Course = {
  id: string;
  name: string;
};

export default function CoursePage() {
  const params = useParams();
  const { id: courseId } = params;
  const { profile, loading: authLoading } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (authLoading || !profile?.college || !profile?.department || typeof courseId !== 'string') return;
      
      setLoading(true);
      try {
        const courses = await getCourses(profile.college, profile.department) as Course[];
        const foundCourse = courses.find(c => c.id === courseId);
        setCourse(foundCourse || null);
      } catch (error) {
        console.error("Error fetching course details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseDetails();
  }, [courseId, profile, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Card>
            <CardHeader>
                <Skeleton className="h-7 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
                 <Skeleton className="h-4 w-full" />
                 <Skeleton className="h-4 w-full" />
                 <Skeleton className="h-4 w-5/6" />
            </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!course) {
    return (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-8 text-center">
            <div>
              <h3 className="text-xl font-semibold">Course Not Found</h3>
              <p className="text-muted-foreground mt-2">The requested course could not be found in your department.</p>
            </div>
        </div>
    )
  }

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Course Details</h1>
      </div>
      <Card>
        <CardHeader>
            <div className='flex items-center gap-4'>
                <BookOpen className="h-8 w-8 text-primary" />
                <div>
                    <CardTitle>{course.name}</CardTitle>
                    <CardDescription>{course.id}</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">
                This is a placeholder page for the course. More details and features for each course will be added in the future.
            </p>
        </CardContent>
      </Card>
    </>
  );
}
