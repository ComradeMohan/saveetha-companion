
'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, Save, CheckCircle } from 'lucide-react';
import { collection, doc, getDoc, setDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Label } from '@/components/ui/label';
import { getCourses } from '@/app/actions/manage-courses';

type Course = {
  id: string;
  name: string;
};

const grades = ['S', 'A', 'B', 'C', 'D', 'E'];

type StudentGrades = {
  [courseCode: string]: string; // e.g., { "CSA02": "A", "UBA01": "S" }
};

export default function CoursesPage() {
    const { user, profile, loading: authLoading } = useAuth();
    const [allCourses, setAllCourses] = useState<Course[]>([]);
    const [studentGrades, setStudentGrades] = useState<StudentGrades>({});
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // State for the new UI
    const [selectedCourse, setSelectedCourse] = useState<string>("");
    const [selectedGrade, setSelectedGrade] = useState<string>("");
    
    const { toast } = useToast();

    useEffect(() => {
        const fetchCourseList = async () => {
             if (!authLoading && profile?.college && profile?.department) {
                 try {
                     const courses = await getCourses(profile.college, profile.department) as Course[];
                     setAllCourses(courses);
                 } catch (error) {
                     console.error("Error fetching courses for dropdown:", error);
                 }
             }
        };
        fetchCourseList();
    }, [profile, authLoading]);

    useEffect(() => {
        if (authLoading || !user) return;

        setLoading(true);
        const docRef = doc(db, 'student_grades', user.uid);
        
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                setStudentGrades(docSnap.data());
            } else {
                setStudentGrades({});
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching grades:", error);
            toast({ title: "Error", description: "Could not fetch your grades.", variant: "destructive" });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, authLoading, toast]);

    useEffect(() => {
        // When selectedCourse changes, update the grade dropdown
        if (selectedCourse && studentGrades[selectedCourse]) {
            setSelectedGrade(studentGrades[selectedCourse]);
        } else {
            setSelectedGrade("");
        }
    }, [selectedCourse, studentGrades]);

    const handleSaveGrade = async () => {
        if (!user) {
            toast({ title: "Error", description: "You are not logged in.", variant: "destructive"});
            return;
        }
        if (!selectedCourse || !selectedGrade) {
            toast({ title: "Error", description: "Please select a course and a grade.", variant: "destructive"});
            return;
        }

        setIsSaving(true);
        try {
            const docRef = doc(db, 'student_grades', user.uid);
            const newGrades = { ...studentGrades };

            if (selectedGrade !== 'none') {
                newGrades[selectedCourse] = selectedGrade;
            } else {
                delete newGrades[selectedCourse];
            }
            
            await setDoc(docRef, newGrades);

            toast({ title: "Success", description: "Your grade has been saved." });
        } catch (error) {
            console.error("Error saving grade:", error);
            toast({ title: "Error", description: "Could not save your grade.", variant: "destructive"});
        } finally {
            setIsSaving(false);
        }
    }

    const comboboxOptions = useMemo(() => {
        return allCourses.map(course => ({
            value: course.id,
            label: `${course.id} - ${course.name}`
        }));
    }, [allCourses]);

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
                  <p className="text-muted-foreground mt-2">Please complete your profile from the main site to log your grades.</p>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">Log Course Grades</h1>
            </div>
            <div className="flex flex-1 items-start justify-center rounded-lg border border-dashed shadow-sm mt-4">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Select Course and Grade</CardTitle>
                        <CardDescription>
                           Choose a course, assign a grade, and save. Your roadmap will update automatically.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 md:space-y-0 md:grid md:grid-cols-3 md:gap-4 items-end">
                        <div className="md:col-span-2 space-y-2">
                           <Label>Course</Label>
                           <Combobox
                                options={comboboxOptions}
                                value={selectedCourse}
                                onChange={setSelectedCourse}
                                placeholder="Search for a course..."
                                searchPlaceholder="Search course code or name..."
                                notFoundMessage="No course found."
                           />
                        </div>
                        <div className="space-y-2">
                             <Label>Grade</Label>
                             <Select 
                                value={selectedGrade} 
                                onValueChange={setSelectedGrade}
                                disabled={!selectedCourse}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Grade" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none"> - (Clear Grade)</SelectItem>
                                    {grades.map(grade => (
                                        <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                    <CardFooter>
                         <Button onClick={handleSaveGrade} disabled={isSaving || !selectedCourse || !selectedGrade}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                            Save Grade
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </>
    )
}
