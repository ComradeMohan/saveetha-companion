
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, Save, Check, BookOpen, PlusCircle, Search } from 'lucide-react';
import { collection, doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Label } from '@/components/ui/label';
import { getCourses } from '@/app/actions/manage-courses';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BulkGradeEntry } from '@/components/learn/bulk-grade-entry';
import { SuggestCourseDialog } from '@/components/learn/suggest-course-dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

type Course = {
  id: string;
  name: string;
};

const grades = ['S', 'A', 'B', 'C', 'D', 'E'];

const gradeColorClasses: Record<string, string> = {
    S: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700',
    A: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700',
    B: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-700',
    C: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700',
    D: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-700',
    E: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700',
};


type StudentGrades = {
  [courseCode: string]: string; // e.g., { "CSA02": "A", "UBA01": "S" }
};

export default function CoursesPage() {
    const { user, profile, loading: authLoading } = useAuth();
    const [allCourses, setAllCourses] = useState<Course[]>([]);
    const [studentGrades, setStudentGrades] = useState<StudentGrades>({});
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    
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
            
            await setDoc(docRef, newGrades, { merge: true });

            toast({ title: "Success", description: "Your grade has been saved." });
            setSelectedCourse("");
            setSelectedGrade("");
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

    const filteredCompletedCourses = useMemo(() => {
        const completedCourses = Object.entries(studentGrades).map(([courseCode, grade]) => {
            const course = allCourses.find(c => c.id === courseCode);
            return {
                id: courseCode,
                name: course?.name || 'Unknown Course',
                grade
            };
        }).sort((a, b) => a.id.localeCompare(b.id));

        if (!searchTerm) {
            return completedCourses;
        }
        const lowercasedFilter = searchTerm.toLowerCase();
        return completedCourses.filter(course =>
            course.name.toLowerCase().includes(lowercasedFilter) ||
            course.id.toLowerCase().includes(lowercasedFilter)
        );
    }, [studentGrades, allCourses, searchTerm]);


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
                <SuggestCourseDialog />
            </div>

            <BulkGradeEntry 
                allCourses={allCourses}
                existingGrades={studentGrades}
                onSave={(newGrades) => setStudentGrades(prev => ({...prev, ...newGrades}))}
            />

            <div className="flex flex-1 items-start justify-center rounded-lg border border-dashed shadow-sm mt-4">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Single Grade Entry</CardTitle>
                        <CardDescription>
                           Use this form to add or update a single grade.
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
            
            <Card className="mt-6">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Check className="h-5 w-5 text-green-500" />
                                Completed Courses
                            </CardTitle>
                            <CardDescription className="mt-1">A list of all the grades you have logged so far.</CardDescription>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Filter courses..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 w-full sm:w-64"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {Object.keys(studentGrades).length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Course Code</TableHead>
                                    <TableHead>Course Name</TableHead>
                                    <TableHead className="text-right">Grade</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCompletedCourses.length > 0 ? filteredCompletedCourses.map(course => (
                                    <TableRow key={course.id}>
                                        <TableCell className="font-mono">{course.id}</TableCell>
                                        <TableCell>{course.name}</TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant="outline" className={cn("text-base font-bold", gradeColorClasses[course.grade])}>
                                                {course.grade}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">
                                            No courses match your search.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    ) : (
                         <div className="text-center text-muted-foreground py-10">
                            <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/50"/>
                            <p className="mt-4">You haven't logged any grades yet.</p>
                         </div>
                    )}
                </CardContent>
            </Card>
        </>
    )
}
