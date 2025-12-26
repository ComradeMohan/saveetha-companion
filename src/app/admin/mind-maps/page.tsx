'use client';

import { useState, useTransition, useMemo, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Loader2, Wand2, ListChecks, Save, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getUnifiedCourses } from '@/app/actions/manage-course-content';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { adminDb } from '@/lib/firebase-admin'; // This will not work on client, needs a server action
import { doc, getDoc, setDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

type Course = { id: string; name: string };

async function saveMindMap(courseId: string, mindMapJson: string) {
    'use server';
    try {
        const mindMapData = JSON.parse(mindMapJson);
        const docRef = doc(db, 'mind-maps', courseId);
        await setDoc(docRef, mindMapData);
        // This revalidation will likely need to be triggered differently, maybe via a route handler
        // revalidatePath(`/learn/course/${courseId}`); 
        return { type: 'success', message: 'Mind map saved successfully!' };
    } catch(e: any) {
        if (e instanceof SyntaxError) {
            return { type: 'error', message: 'Invalid JSON format. Please check your syntax.' };
        }
        return { type: 'error', message: e.message || 'An unexpected error occurred.' };
    }
}

async function getCoursesWithMindMaps() {
    'use server';
    const snapshot = await getDocs(collection(db, 'mind-maps'));
    return snapshot.docs.map(doc => doc.id);
}


export default function MindMapsPage() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesWithMindMaps, setCoursesWithMindMaps] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [pastedJson, setPastedJson] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = () => {
    startTransition(async () => {
      const [coursesData, mindMapCoursesData] = await Promise.all([
        getUnifiedCourses(),
        getCoursesWithMindMaps()
      ]);
      setCourses(coursesData);
      setCoursesWithMindMaps(mindMapCoursesData);
    });
  }

  useEffect(() => {
    fetchData();
  }, []);
  
  useEffect(() => {
      const fetchExistingMap = async () => {
          if (selectedCourse) {
              setPastedJson('');
              const docRef = doc(db, 'mind-maps', selectedCourse);
              const docSnap = await getDoc(docRef);
              if (docSnap.exists()) {
                  setPastedJson(JSON.stringify(docSnap.data(), null, 2));
              }
          }
      };
      fetchExistingMap();
  }, [selectedCourse]);

  const courseOptions = useMemo(
    () =>
      courses.map((c) => ({
        value: c.id,
        label: `${c.name} (${c.id})`,
      })),
    [courses]
  );
  
  const courseHasMindMap = useMemo(() => coursesWithMindMaps.includes(selectedCourse), [coursesWithMindMaps, selectedCourse]);

  const handleSave = async () => {
    if (!selectedCourse) {
      toast({ title: 'Error', description: 'Please select a course first.', variant: 'destructive' });
      return;
    }
    if (!pastedJson.trim()) {
      toast({ title: 'Error', description: 'JSON content cannot be empty.', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    const result = await saveMindMap(selectedCourse, pastedJson);
    toast({
        title: result.type === 'success' ? 'Success' : 'Error',
        description: result.message,
        variant: result.type === 'error' ? 'destructive' : 'default'
    });
    if (result.type === 'success') {
        fetchData();
    }
    setIsSaving(false);
  };
  
  const getCourseName = (id: string) => courses.find(c => c.id === id)?.name || id;


  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Mind Map Management</h2>
        <p className="text-muted-foreground">Upload and manage JSON mind maps for each course.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Mind Map Editor</CardTitle>
            <CardDescription>Select a course, then paste the JSON for its mind map. Saving will overwrite any existing data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Combobox
              options={courseOptions}
              value={selectedCourse}
              onChange={setSelectedCourse}
              placeholder="Select a course..."
              searchPlaceholder="Search courses..."
              notFoundMessage="No course found."
            />
            {courseHasMindMap && (
                <Alert variant="default" className="border-yellow-500/50 text-yellow-700 dark:text-yellow-400 [&>svg]:text-yellow-600">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>This course already has a mind map.</AlertTitle>
                    <AlertDescription>
                        Saving new content will replace the existing one.
                    </AlertDescription>
                </Alert>
            )}
            <Textarea
              placeholder='{ "course_code": "...", "course_title": "...", "mind_map": { ... } }'
              className="min-h-[60vh] font-mono text-xs"
              value={pastedJson}
              onChange={(e) => setPastedJson(e.target.value)}
              disabled={!selectedCourse}
            />
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave} disabled={isSaving || !pastedJson.trim() || !selectedCourse}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Mind Map for {selectedCourse || '...'}
            </Button>
          </CardFooter>
        </Card>

        <div className="lg:col-span-1 space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ListChecks /> Courses with Mind Maps</CardTitle>
                </CardHeader>
                <CardContent className="max-h-[70vh] overflow-y-auto">
                    {isPending ? (
                        <div className="flex justify-center items-center h-24">
                             <Loader2 className="h-6 w-6 animate-spin"/>
                        </div>
                    ) : coursesWithMindMaps.length > 0 ? (
                         <ul className="space-y-2 text-sm text-muted-foreground">
                            {coursesWithMindMaps.map(id => (
                                <li key={id} className="p-2 bg-secondary/50 rounded-md">
                                    <span className="font-semibold">{getCourseName(id)}</span> ({id})
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-center text-muted-foreground py-4">No courses have mind maps yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
