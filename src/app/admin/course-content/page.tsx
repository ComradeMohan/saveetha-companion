
'use client';

import { useEffect, useState, useTransition, Fragment } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, PlusCircle, Trash2, BookOpen, ChevronRight, Edit, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getColleges } from '@/app/actions/manage-colleges';
import { getDepartments } from '@/app/actions/manage-departments';
import { getCourses } from '@/app/actions/manage-courses';
import { addUnit, getUnits, deleteUnit, addTopic, getTopics, deleteTopic } from '@/app/actions/manage-course-content';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AddTopicDialog } from '@/components/admin/course-content/add-topic-dialog';
import type { Unit, Topic } from '@/app/actions/manage-course-content';
import { generateCourseContent } from '@/ai/flows/course-creator-flow';


type College = { id: string; name: string };
type Department = { id: string; name: string };
type Course = { id: string; name: string };


export default function CourseContentPage() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [colleges, setColleges] = useState<College[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [topics, setTopics] = useState<Record<string, Topic[]>>({});

  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  const [newUnitTitle, setNewUnitTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Initial data loading for dropdowns
  useEffect(() => {
    startTransition(async () => {
      const collegesData = await getColleges();
      setColleges(collegesData as College[]);
    });
  }, []);

  useEffect(() => {
    if (selectedCollege) {
      startTransition(async () => {
        const departmentsData = await getDepartments(selectedCollege);
        setDepartments(departmentsData as Department[]);
        setCourses([]);
        setUnits([]);
        setSelectedDepartment('');
        setSelectedCourse('');
      });
    }
  }, [selectedCollege]);

  useEffect(() => {
    if (selectedDepartment) {
      startTransition(async () => {
        const coursesData = await getCourses(selectedCollege, selectedDepartment);
        setCourses(coursesData as Course[]);
        setUnits([]);
        setSelectedCourse('');
      });
    }
  }, [selectedDepartment, selectedCollege]);

  // Fetch units when a course is selected
  useEffect(() => {
    if (selectedCourse) {
      startTransition(async () => {
        const unitsData = await getUnits(selectedCollege, selectedDepartment, selectedCourse);
        setUnits(unitsData as Unit[]);
      });
    } else {
        setUnits([]);
    }
  }, [selectedCourse, selectedCollege, selectedDepartment]);
  
  // Fetch topics for each unit
  useEffect(() => {
    if (units.length > 0) {
        startTransition(async () => {
            const allTopics: Record<string, Topic[]> = {};
            for (const unit of units) {
                const topicsData = await getTopics(selectedCollege, selectedDepartment, selectedCourse, unit.id);
                allTopics[unit.id] = topicsData;
            }
            setTopics(allTopics);
        });
    } else {
        setTopics({});
    }
  }, [units, selectedCollege, selectedDepartment, selectedCourse]);

  const refreshCourseData = async () => {
    if (selectedCourse) {
        const unitsData = await getUnits(selectedCollege, selectedDepartment, selectedCourse);
        setUnits(unitsData as Unit[]);
    }
  }

  const handleAddUnit = () => {
    if (!newUnitTitle.trim()) return;
    startTransition(async () => {
      const result = await addUnit(selectedCollege, selectedDepartment, selectedCourse, newUnitTitle, units.length + 1);
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
        const result = await deleteUnit(selectedCollege, selectedDepartment, selectedCourse, unitId);
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
        const result = await deleteTopic(selectedCollege, selectedDepartment, selectedCourse, unitId, topicId);
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

  const handleAiGenerate = async () => {
      if (!selectedCourse) return;
      const courseName = courses.find(c => c.id === selectedCourse)?.name;
      if (!courseName) return;

      setIsGenerating(true);
      toast({ title: "AI Generation Started", description: `Generating content for ${courseName}. This may take a minute...` });
      try {
          const content = await generateCourseContent({ courseName });
          
          for (const unit of content.units) {
              const unitResult = await addUnit(selectedCollege, selectedDepartment, selectedCourse, unit.title, unit.order);
              if (unitResult.id) {
                  for (const topic of unit.topics) {
                      const formData = new FormData();
                      formData.append('title', topic.title);
                      formData.append('notes', topic.notes || '');
                      formData.append('videoUrl', topic.videoUrl || '');
                      formData.append('questions', topic.questions || '');
                      await addTopic(selectedCollege, selectedDepartment, selectedCourse, unitResult.id, formData);
                  }
              }
          }
          toast({ title: "Success!", description: "AI has finished generating the course content." });
          refreshCourseData();

      } catch (error) {
          console.error("Error generating course content:", error);
          toast({ title: "Generation Failed", description: "The AI failed to generate content. Please try again.", variant: 'destructive' });
      } finally {
          setIsGenerating(false);
      }
  };


  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Course Content Management</h2>
        <p className="text-muted-foreground">Add and organize learning materials for each course.</p>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Select a Course</CardTitle>
            <CardDescription>Choose the college, department, and course you want to manage.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
           <Select onValueChange={setSelectedCollege} value={selectedCollege}>
              <SelectTrigger><SelectValue placeholder="Select a College" /></SelectTrigger>
              <SelectContent>
                {colleges.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select onValueChange={setSelectedDepartment} value={selectedDepartment} disabled={!selectedCollege}>
              <SelectTrigger><SelectValue placeholder="Select a Department"/></SelectTrigger>
              <SelectContent>
                {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select onValueChange={setSelectedCourse} value={selectedCourse} disabled={!selectedDepartment}>
              <SelectTrigger><SelectValue placeholder="Select a Course"/></SelectTrigger>
              <SelectContent>
                {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name} ({c.id})</SelectItem>)}
              </SelectContent>
            </Select>
        </CardContent>
      </Card>
      
      {selectedCourse && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
             <Card className="lg:col-span-2">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Course Structure</CardTitle>
                            <CardDescription>Manage units and topics for {selectedCourse}.</CardDescription>
                        </div>
                        <Button onClick={handleAiGenerate} disabled={isGenerating || units.length > 0}>
                            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4" />}
                             Generate with AI
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {isPending && !units.length ? <Loader2 className="mx-auto h-8 w-8 animate-spin" /> :
                     units.length > 0 ? (
                        <Accordion type="multiple" className="w-full">
                            {units.map(unit => (
                                <AccordionItem key={unit.id} value={unit.id}>
                                    <div className="flex items-center w-full">
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
                                                            <Button variant="ghost" size="icon" className="h-7 w-7">
                                                                <Edit className="h-4 w-4"/>
                                                            </Button>
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
                                                collegeId={selectedCollege}
                                                departmentId={selectedDepartment}
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

            <Card>
                <CardHeader>
                    <CardTitle>Add New Unit</CardTitle>
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
      )}
    </div>
  );
}
