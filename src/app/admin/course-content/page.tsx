
'use client';

import { useEffect, useState, useTransition, useMemo, useRef, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/ui/combobox';
import { Loader2, PlusCircle, Trash2, BookOpen, ChevronRight, Edit, Wand2, UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getUnifiedCourses, addUnit, getUnits, deleteUnit, getTopics, deleteTopic, addTopic } from '@/app/actions/manage-course-content';
import { importCourseFromJson } from '@/app/actions/manage-course-content-json';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AddTopicDialog } from '@/components/admin/course-content/add-topic-dialog';
import type { Unit, Topic } from '@/app/actions/manage-course-content';
import { generateCourseContent } from '@/ai/flows/course-creator-flow';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { EditTopicDialog } from '@/components/admin/course-content/edit-topic-dialog';


type Course = { id: string; name: string };

const jsonInitialState = { type: '', message: '' };

function JsonSubmitButton() {
    const { pending } = useFormStatus();
    return (
         <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <UploadCloud className="mr-2 h-4 w-4" />}
            {pending ? 'Importing...' : 'Import from JSON'}
        </Button>
    )
}


export default function CourseContentPage() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [courses, setCourses] = useState<Course[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [topics, setTopics] = useState<Record<string, Topic[]>>({});
  const [pendingCourses, setPendingCourses] = useState<Course[]>([]);

  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedCourseName, setSelectedCourseName] = useState('');

  const [newUnitTitle, setNewUnitTitle] = useState('');
  const [syllabusText, setSyllabusText] = useState('');
  const [generatingCourses, setGeneratingCourses] = useState<Set<string>>(new Set());

  const jsonFormRef = useRef<HTMLFormElement>(null);
  const [jsonState, jsonFormAction] = useActionState(importCourseFromJson, jsonInitialState);

  // Initial data loading for dropdowns
  useEffect(() => {
    startTransition(async () => {
      const coursesData = await getUnifiedCourses();
      setCourses(coursesData);
      
      const contentCheckPromises = coursesData.map(async course => {
        const units = await getUnits(course.id);
        return { course, hasContent: units.length > 0 };
      });
      const results = await Promise.all(contentCheckPromises);
      setPendingCourses(results.filter(r => !r.hasContent).map(r => r.course));

    });
  }, []);

  // Fetch units when a course is selected
  useEffect(() => {
    if (selectedCourse) {
      startTransition(async () => {
        const unitsData = await getUnits(selectedCourse);
        setUnits(unitsData as Unit[]);
        setSelectedCourseName(courses.find(c => c.id === selectedCourse)?.name || '');
      });
    } else {
        setUnits([]);
        setSelectedCourseName('');
    }
  }, [selectedCourse, courses]);
  
  // Fetch topics for each unit
  useEffect(() => {
    if (units.length > 0) {
        startTransition(async () => {
            const allTopics: Record<string, Topic[]> = {};
            for (const unit of units) {
                const topicsData = await getTopics(selectedCourse, unit.id);
                allTopics[unit.id] = topicsData;
            }
            setTopics(allTopics);
        });
    } else {
        setTopics({});
    }
  }, [units, selectedCourse]);

  // Effect for JSON upload form
    useEffect(() => {
        if (jsonState.type) {
            toast({
                title: jsonState.type === 'success' ? 'Success' : 'Error',
                description: jsonState.message,
                variant: jsonState.type === 'error' ? 'destructive' : 'default',
            });
            if (jsonState.type === 'success') {
                jsonFormRef.current?.reset();
                refreshCourseData();
            }
        }
    }, [jsonState, toast]);

  const refreshCourseData = async () => {
    if (selectedCourse) {
        const unitsData = await getUnits(selectedCourse);
        setUnits(unitsData as Unit[]);
    }
     // Refresh pending courses list
    const contentCheckPromises = courses.map(async course => {
        const units = await getUnits(course.id);
        return { course, hasContent: units.length > 0 };
    });
    const results = await Promise.all(contentCheckPromises);
    setPendingCourses(results.filter(r => !r.hasContent).map(r => r.course));
  }

  const handleAddUnit = () => {
    if (!newUnitTitle.trim()) return;
    startTransition(async () => {
      const result = await addUnit(selectedCourse, newUnitTitle, units.length + 1);
      toast({
        title: result.type === 'success' ? 'Success' : 'Error',
        description: result.message,
        variant: result.type === 'error' ? 'destructive' : 'default',
      });
      if (result.type === 'success') {
        setNewUnitTitle('');
        refreshCourseData();
      }
    });
  };

  const handleDeleteUnit = (unitId: string) => {
    startTransition(async () => {
        const result = await deleteUnit(selectedCourse, unitId);
        toast({
            title: result.type === 'success' ? 'Success' : 'Error',
            description: result.message,
            variant: result.type === 'error' ? 'destructive' : 'default',
        });
        if (result.type === 'success') {
            refreshCourseData();
        }
    });
  };

  const handleTopicAction = () => {
      refreshCourseData();
  }

   const handleDeleteTopic = (unitId: string, topicId: string) => {
    startTransition(async () => {
        const result = await deleteTopic(selectedCourse, unitId, topicId);
        toast({
            title: result.type === 'success' ? 'Success' : 'Error',
            description: result.message,
            variant: result.type === 'error' ? 'destructive' : 'default',
        });
        if (result.type === 'success') {
            refreshCourseData();
        }
    });
  };

  const handleAiGenerate = async (courseId: string, courseName: string, syllabus?: string) => {
      setGeneratingCourses(prev => new Set(prev).add(courseId));
      toast({ title: "AI Generation Started", description: `Generating content for ${courseName}. This may take a minute...` });
      try {
          const content = await generateCourseContent({ 
            courseName: courseName,
            syllabus: syllabus || undefined
          });
          
          const existingUnits = await getUnits(courseId);
          for (const unit of existingUnits) {
            await deleteUnit(courseId, unit.id);
          }

          for (const unit of content.units) {
              const unitResult = await addUnit(courseId, unit.title, unit.order);
              if (unitResult.id) {
                  for (const topic of unit.topics) {
                      const formData = new FormData();
                      formData.append('title', topic.title);
                      formData.append('notes', topic.notes || '');
                      formData.append('videoUrl', topic.videoUrl || '');
                      formData.append('questions', topic.questions || '');
                      await addTopic(courseId, unitResult.id, formData);
                  }
              }
          }
          toast({ title: "Success!", description: `AI has finished generating content for ${courseName}.` });
          refreshCourseData();

      } catch (error) {
          console.error("Error generating course content:", error);
          toast({ title: "Generation Failed", description: `The AI failed to generate content for ${courseName}. Please try again.`, variant: 'destructive' });
      } finally {
          setGeneratingCourses(prev => {
              const newSet = new Set(prev);
              newSet.delete(courseId);
              return newSet;
          });
      }
  };

  const courseOptions = useMemo(() => 
    courses.map(c => ({
        value: c.id,
        label: `${c.name} (${c.id})`
    })), [courses]);


  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Course Content Management</h2>
        <p className="text-muted-foreground">Add and organize learning materials for each course. Content is shared across all departments.</p>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Select a Course</CardTitle>
            <CardDescription>Choose the course you want to manage.</CardDescription>
        </CardHeader>
        <CardContent>
            <Combobox
                options={courseOptions}
                value={selectedCourse}
                onChange={setSelectedCourse}
                placeholder="Search by course name or code..."
                searchPlaceholder="Search courses..."
                notFoundMessage="No course found."
            />
        </CardContent>
      </Card>
      
      {selectedCourse && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
             <Card className="lg:col-span-2">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Course Structure</CardTitle>
                            <CardDescription>Manage units and topics for {selectedCourseName} ({selectedCourse}).</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isPending && !units.length ? <Loader2 className="mx-auto h-8 w-8 animate-spin" /> :
                     units.length > 0 ? (
                        <Accordion type="multiple" className="w-full">
                            {units.map(unit => (
                                <AccordionItem key={unit.id} value={unit.id}>
                                    <div className="flex items-center w-full group">
                                        <AccordionTrigger className="flex-1 hover:no-underline">
                                            <div className='flex items-center gap-3'>
                                                <BookOpen className="h-5 w-5 text-primary" />
                                                <span className="font-semibold">{unit.title}</span>
                                            </div>
                                        </AccordionTrigger>
                                        <Button variant="ghost" size="icon" className="text-destructive h-7 w-7 mr-2" onClick={() => handleDeleteUnit(unit.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <AccordionContent className="pl-8 pr-4">
                                       <div className="space-y-3">
                                            {(topics[unit.id] || []).length > 0 ? (
                                                topics[unit.id].map(topic => (
                                                    <div key={topic.id} className="flex items-center justify-between p-3 rounded-md bg-secondary/50">
                                                        <span>{topic.title}</span>
                                                        <div className="flex items-center gap-1">
                                                            <EditTopicDialog
                                                                topic={topic}
                                                                courseId={selectedCourse}
                                                                unitId={unit.id}
                                                                onTopicUpdated={handleTopicAction}
                                                            >
                                                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                                                    <Edit className="h-4 w-4"/>
                                                                </Button>
                                                            </EditTopicDialog>
                                                             <Button variant="ghost" size="icon" className="text-destructive h-7 w-7" onClick={() => handleDeleteTopic(unit.id, topic.id)}>
                                                                <Trash2 className="h-4 w-4"/>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-muted-foreground">No topics yet. Add one to get started.</p>
                                            )}

                                            <AddTopicDialog 
                                                courseId={selectedCourse}
                                                unitId={unit.id}
                                                onTopicAdded={handleTopicAction}
                                            >
                                                <Button variant="outline" size="sm" className="mt-4">
                                                    <PlusCircle className="mr-2 h-4 w-4"/> Add Topic
                                                </Button>
                                            </AddTopicDialog>
                                       </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                     ) : (
                        <p className="text-center text-muted-foreground py-8">No units found for this course. Add one manually or use the AI generator.</p>
                     )}
                </CardContent>
            </Card>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Bulk JSON Upload</CardTitle>
                        <CardDescription>
                            Quickly populate a course by uploading a formatted JSON file.
                        </CardDescription>
                    </CardHeader>
                    <form ref={jsonFormRef} action={jsonFormAction}>
                        <CardContent>
                             <input type="hidden" name="courseId" value={selectedCourse} />
                            <div className="space-y-2">
                                <Label htmlFor="jsonFile">Course JSON File</Label>
                                <Input id="jsonFile" name="jsonFile" type="file" accept=".json" />
                            </div>
                        </CardContent>
                        <CardFooter>
                           <JsonSubmitButton />
                        </CardFooter>
                    </form>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>AI Content Generation</CardTitle>
                        <CardDescription>
                            Paste the course syllabus here to generate all units and topics automatically. This will overwrite existing content for this course.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                             <Label htmlFor="syllabus">Syllabus Text (Optional)</Label>
                            <Textarea 
                                id="syllabus"
                                placeholder="UNIT I: INTRODUCTION&#10;Role of Algorithms in Computing - Insertion sort..."
                                className="min-h-36"
                                value={syllabusText}
                                onChange={(e) => setSyllabusText(e.target.value)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                         <Button onClick={() => handleAiGenerate(selectedCourse, selectedCourseName, syllabusText)} disabled={generatingCourses.has(selectedCourse)}>
                            {generatingCourses.has(selectedCourse) ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4" />}
                             {syllabusText ? 'Generate from Syllabus' : 'Generate from Title'}
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Add New Unit Manually</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Input
                                placeholder="e.g., Unit 1: Introduction"
                                value={newUnitTitle}
                                onChange={(e) => setNewUnitTitle(e.target.value)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleAddUnit} disabled={isPending || !newUnitTitle.trim()}>
                            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <PlusCircle className="mr-2 h-4 w-4"/>} Add Unit
                        </Button>
                    </CardFooter>
                </Card>
            </div>

          </div>
      )}

        {pendingCourses.length > 0 && !selectedCourse && (
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Pending Courses</CardTitle>
                    <CardDescription>These courses have no content yet. Use the button to generate it with AI.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                    {pendingCourses.map(course => (
                        <div key={course.id} className="flex items-center justify-between p-3 rounded-md bg-secondary/50">
                            <div>
                                <p className="font-semibold">{course.name}</p>
                                <p className="text-sm text-muted-foreground">{course.id}</p>
                            </div>
                            <Button size="sm" onClick={() => handleAiGenerate(course.id, course.name)} disabled={generatingCourses.has(course.id)}>
                                {generatingCourses.has(course.id) ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4" />}
                                Generate
                            </Button>
                        </div>
                    ))}
                </CardContent>
            </Card>
        )}
    </div>
  );
}
