
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
import { Loader2, PlusCircle, Trash2, BookOpen, ChevronRight, Edit, Wand2, UploadCloud, Save, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getUnifiedCourses, addUnit, deleteUnit, addTopic, getAllCourseContent, saveMindMap, getMindMapForCourse } from '@/app/actions/manage-course-content';
import { importCourseFromJson } from '@/app/actions/manage-course-content-json';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AddTopicDialog } from '@/components/admin/course-content/add-topic-dialog';
import type { Unit, Topic } from '@/app/actions/manage-course-content';
import { generateCourseContent } from '@/ai/flows/course-creator-flow';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { EditTopicDialog } from '@/components/admin/course-content/edit-topic-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


type Course = { id: string; name: string };
type CourseContent = { units: Unit[]; topics: Record<string, Topic[]> };

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
  
  const [mindMapJson, setMindMapJson] = useState('');
  const [isSavingMindMap, setIsSavingMindMap] = useState(false);
  const [courseHasMindMap, setCourseHasMindMap] = useState(false);


  // Initial data loading for dropdowns
  useEffect(() => {
    startTransition(async () => {
      const coursesData = await getUnifiedCourses();
      setCourses(coursesData);
      
      const contentCheckPromises = coursesData.map(async course => {
        const { units } = await getAllCourseContent(course.id);
        return { course, hasContent: units.length > 0 };
      });
      const results = await Promise.all(contentCheckPromises);
      setPendingCourses(results.filter(r => !r.hasContent).map(r => r.course));

    });
  }, []);

  // Fetch all content when a course is selected
  useEffect(() => {
    if (selectedCourse) {
      startTransition(async () => {
        const { units, topics } = await getAllCourseContent(selectedCourse);
        setUnits(units);
        setTopics(topics);
        setSelectedCourseName(courses.find(c => c.id === selectedCourse)?.name || '');
        
        // Fetch mind map data
        setMindMapJson(''); // Reset first
        const mindMapData = await getMindMapForCourse(selectedCourse);
        if (mindMapData) {
          setMindMapJson(JSON.stringify(mindMapData, null, 2));
          setCourseHasMindMap(true);
        } else {
          setCourseHasMindMap(false);
        }

      });
    } else {
        setUnits([]);
        setTopics({});
        setSelectedCourseName('');
        setMindMapJson('');
        setCourseHasMindMap(false);
    }
  }, [selectedCourse, courses]);
  
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
        const { units, topics } = await getAllCourseContent(selectedCourse);
        setUnits(units);
        setTopics(topics);
    }
     // Refresh pending courses list
    const contentCheckPromises = courses.map(async course => {
        const { units } = await getAllCourseContent(course.id);
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

  const handleTopicAction = () => {
      refreshCourseData();
  }

  const handleAiGenerate = async (courseId: string, courseName: string, syllabus?: string) => {
      setGeneratingCourses(prev => new Set(prev).add(courseId));
      toast({ title: "AI Generation Started", description: `Generating content for ${courseName}. This may take a minute...` });
      try {
          const content = await generateCourseContent({ 
            courseName: courseName,
            syllabus: syllabus || undefined
          });
          
          const { units: existingUnits } = await getAllCourseContent(courseId);
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
          if(courseId === selectedCourse) {
            refreshCourseData();
          }

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

  const handleSaveMindMap = async () => {
    if (!selectedCourse || !mindMapJson.trim()) {
      toast({ title: 'Error', description: 'Please select a course and provide JSON content.', variant: 'destructive' });
      return;
    }

    setIsSavingMindMap(true);
    const result = await saveMindMap(selectedCourse, mindMapJson);
    toast({
        title: result.type === 'success' ? 'Success' : 'Error',
        description: result.message,
        variant: result.type === 'error' ? 'destructive' : 'default'
    });
     if (result.type === 'success') {
        setCourseHasMindMap(true);
    }
    setIsSavingMindMap(false);
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
                                    <AccordionTrigger className="text-base font-semibold hover:no-underline">
                                        <div className='flex items-center gap-3'>
                                            <BookOpen className="h-5 w-5 text-primary" />
                                            {unit.title}
                                        </div>
                                    </AccordionTrigger>
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
                 <CardFooter className="border-t pt-6">
                    <div className="space-y-2 w-full">
                        <Label htmlFor="new-unit">Add New Unit Manually</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="new-unit"
                                placeholder="e.g., Unit 1: Introduction"
                                value={newUnitTitle}
                                onChange={(e) => setNewUnitTitle(e.target.value)}
                            />
                            <Button onClick={handleAddUnit} disabled={isPending || !newUnitTitle.trim()}>
                                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <PlusCircle className="mr-2 h-4 w-4"/>} Add Unit
                            </Button>
                        </div>
                    </div>
                 </CardFooter>
            </Card>

            <div className="space-y-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Mind Map</CardTitle>
                        <CardDescription>Paste the JSON for this course's mind map. This will enable the visual mind map viewer for students.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {courseHasMindMap && (
                            <Alert className="mb-4">
                                <AlertTriangle className="h-4 w-4"/>
                                <AlertTitle>Mind Map Exists</AlertTitle>
                                <AlertDescription>
                                    A mind map already exists for this course. Saving will overwrite the current data.
                                </AlertDescription>
                            </Alert>
                        )}
                        <Textarea
                            placeholder='{ "course_code": "...", "mind_map": { ... } }'
                            className="min-h-48 font-mono text-xs"
                            value={mindMapJson}
                            onChange={(e) => setMindMapJson(e.target.value)}
                            />
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleSaveMindMap} disabled={isSavingMindMap || !mindMapJson.trim()}>
                            {isSavingMindMap ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Mind Map
                        </Button>
                    </CardFooter>
                </Card>
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
