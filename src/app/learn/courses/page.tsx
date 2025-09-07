
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

// Simplified data structure, source of truth for all available courses
const allCourses = [
  // Semester 1 & 2
  { code: "UBA01", name: "Engineering Mathematics - I" },
  { code: "UBA05", name: "Engineering Mathematics II" },
  { code: "UBA48", name: "Engineering Physics" },
  { code: "UBA49", name: "Engineering Chemistry" },
  { code: "CSA02", name: "C Programming" },
  { code: "EEA01", name: "Basic Electrical & Electronics Engineering" },
  { code: "BTA01", name: "Biology and Environmental Science" },
  // Semester 3 & 4
  { code: "UBA04", name: "Discrete Mathematics" },
  { code: "CSA03", name: "Data Structures" },
  { code: "ECA47", name: "Principles of Digital System Design" },
  { code: "CSA04", name: "Operating Systems" },
  { code: "CSA05", name: "Database Management Systems" },
  { code: "CSA06", name: "Design and Analysis of Algorithms" },
  { code: "ECA10", name: "Microprocessors and Microcontrollers" },
  // Semester 5 & 6
  { code: "CSA07", name: "Computer Networks" },
  { code: "CSA09", name: "Programming in Java" },
  { code: "CSA10", name: "Software Engineering" },
  { code: "CSA11", name: "Object Oriented Analysis and Design" },
  { code: "CSA12", name: "Computer Architecture" },
  { code: "CSA13", name: "Theory of Computation" },
  { code: "CSA14", name: "Compiler Design" },
  { code: "CSA17", name: "Artificial Intelligence" },
  // Semester 7 & 8
  { code: "UBA33", name: "Principles of Management" },
  { code: "UBA28", name: "Professional Ethics and Legal Practices" },
  { code: "CSA15", name: "Cloud Computing and Big Data Analytics" },
  { code: "CSA51", name: "Cryptography and Network Security" },
  { code: "CSA16", name: "Data warehousing and Data Mining" },
  { code: "ITA14", name: "Ethical Hacking" },
  { code: "SPIC1", name: "Project 1" },
];

const grades = ['S', 'A', 'B', 'C', 'D', 'E'];

type StudentGrades = {
  [courseCode: string]: string; // e.g., { "CSA02": "A", "UBA01": "S" }
};

export default function CoursesPage() {
    const { user, loading: authLoading } = useAuth();
    const [studentGrades, setStudentGrades] = useState<StudentGrades>({});
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // State for the new UI
    const [selectedCourse, setSelectedCourse] = useState<string>("");
    const [selectedGrade, setSelectedGrade] = useState<string>("");
    
    const { toast } = useToast();

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
            value: course.code,
            label: `${course.code} - ${course.name}`
        }));
    }, []);

    if (loading || authLoading) {
        return (
             <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-8">
                <Loader2 className="h-10 w-10 animate-spin text-primary"/>
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
