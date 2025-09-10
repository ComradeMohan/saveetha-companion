
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUnits, getTopics, Unit, Topic, getCourseNameById } from '@/app/actions/manage-course-content';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Loader2, FileText, Youtube, HelpCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import TopicContent from '@/components/learn/topic-content';

type CourseInfo = {
  id: string;
  name: string;
};

type UnitWithTopics = Unit & { topics: Topic[] };

export default function CoursePage() {
  const params = useParams();
  const { id: courseId } = params;
  const { loading: authLoading } = useAuth();
  const [course, setCourse] = useState<CourseInfo | null>(null);
  const [courseContent, setCourseContent] = useState<UnitWithTopics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseData = async () => {
      if (authLoading || typeof courseId !== 'string') return;
      
      setLoading(true);
      try {
        const [courseName, units] = await Promise.all([
            getCourseNameById(courseId),
            getUnits(courseId)
        ]);

        const currentCourse = { id: courseId, name: courseName || `Course ${courseId}` };
        setCourse(currentCourse);
        
        if (units.length > 0) {
            const unitsWithTopics = await Promise.all(
                units.map(async (unit) => {
                    const topics = await getTopics(courseId, unit.id);
                    return { ...unit, topics };
                })
            );
            setCourseContent(unitsWithTopics);
        }

        // Save the last viewed course to localStorage
        if (currentCourse.name) {
          localStorage.setItem('lastViewedCourse', JSON.stringify({ id: currentCourse.id, name: currentCourse.name }));
        }
        
      } catch (error) {
        console.error("Error fetching course data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [courseId, authLoading]);

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
                 <Skeleton className="h-20 w-full" />
                 <Skeleton className="h-20 w-full" />
                 <Skeleton className="h-20 w-full" />
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
              <p className="text-muted-foreground mt-2">The requested course could not be found.</p>
            </div>
        </div>
    )
  }

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Course Content</h1>
      </div>
      <Card>
        <CardHeader>
            <div className='flex items-center gap-4'>
                <div className="p-3 bg-primary/10 rounded-lg">
                    <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <CardTitle>{course.name}</CardTitle>
                    <CardDescription>Review the learning materials for this course ({course.id}).</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            {courseContent.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                    {courseContent.map(unit => (
                        <AccordionItem key={unit.id} value={unit.id}>
                            <AccordionTrigger className="text-base font-semibold hover:no-underline">
                                {unit.title}
                            </AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-2">
                               {unit.topics.length > 0 ? unit.topics.map(topic => (
                                   <div key={topic.id} className="p-4 rounded-md border bg-secondary/40">
                                       <h4 className="font-semibold mb-3">{topic.title}</h4>
                                       <div className="space-y-3">
                                           {topic.notes && (
                                                <div>
                                                    <h5 className="flex items-center gap-2 text-sm font-semibold mb-1"><FileText className="h-4 w-4"/> Notes</h5>
                                                    <TopicContent htmlContent={topic.notes} />
                                                </div>
                                           )}
                                           {topic.videoUrl && (
                                               <div>
                                                   <h5 className="flex items-center gap-2 text-sm font-semibold mb-1"><Youtube className="h-4 w-4 text-red-500"/> Video</h5>
                                                    <Button asChild variant="link" className="p-0 h-auto">
                                                        <a href={topic.videoUrl} target="_blank" rel="noopener noreferrer">{topic.videoUrl}</a>
                                                    </Button>
                                               </div>
                                           )}
                                           {topic.questions && (
                                                <div>
                                                   <h5 className="flex items-center gap-2 text-sm font-semibold mb-1"><HelpCircle className="h-4 w-4 text-blue-500"/> Questions</h5>
                                                    <p className="text-sm whitespace-pre-wrap font-mono bg-muted p-3 rounded-md">{topic.questions}</p>
                                               </div>
                                           )}
                                       </div>
                                   </div>
                               )) : (
                                   <p className="text-sm text-muted-foreground pl-4">No topics have been added to this unit yet.</p>
                               )}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            ) : (
                 <div className="text-center text-muted-foreground py-10">
                    <p>No learning content has been added for this course yet.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </>
  );
}
