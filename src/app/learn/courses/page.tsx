
'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Save } from 'lucide-react';
import { collection, doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

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

const grades = ['S', 'A', 'B', 'C', 'D', 'E', 'F'];

type StudentGrades = {
  [courseCode: string]: string; // e.g., { "CSA02": "A", "UBA01": "S" }
};

export default function CoursesPage() {
    const { user, loading: authLoading } = useAuth();
    const [studentGrades, setStudentGrades] = useState<StudentGrades>({});
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (authLoading || !user) return;

        setLoading(true);
        const docRef = doc(db, 'student_grades', user.uid);
        
        // Use onSnapshot for real-time updates
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


    const handleGradeChange = (courseCode: string, grade: string) => {
        setStudentGrades(prev => {
            const newGrades = { ...prev };
            if (grade && grade !== 'none') {
                newGrades[courseCode] = grade;
            } else {
                delete newGrades[courseCode]; // Remove if grade is cleared
            }
            return newGrades;
        });
    };
    
    const handleSaveChanges = async () => {
        if (!user) {
            toast({ title: "Error", description: "You are not logged in.", variant: "destructive"});
            return;
        }
        setIsSaving(true);
        try {
            const docRef = doc(db, 'student_grades', user.uid);
            await setDoc(docRef, studentGrades, { merge: true });
            toast({ title: "Success", description: "Your grades have been saved." });
        } catch (error) {
            console.error("Error saving grades:", error);
            toast({ title: "Error", description: "Could not save your grades.", variant: "destructive"});
        } finally {
            setIsSaving(false);
        }
    }

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
                <h1 className="text-lg font-semibold md:text-2xl">My Courses</h1>
                 <Button onClick={handleSaveChanges} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                    Save Grades
                </Button>
            </div>
            <div
                className="flex flex-1 items-start justify-center rounded-lg border border-dashed shadow-sm"
            >
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Log Your Grades</CardTitle>
                        <CardDescription>
                           Select a grade for each course you have completed. This will update your roadmap.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Course Code</TableHead>
                                    <TableHead>Course Name</TableHead>
                                    <TableHead className="w-[150px]">Grade</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allCourses.map((course) => (
                                    <TableRow key={course.code}>
                                        <TableCell className="font-mono">{course.code}</TableCell>
                                        <TableCell className="font-medium">{course.name}</TableCell>
                                        <TableCell>
                                             <Select 
                                                value={studentGrades[course.code] || ''} 
                                                onValueChange={(grade) => handleGradeChange(course.code, grade)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="-" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">-</SelectItem>
                                                    {grades.map(grade => (
                                                        <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
