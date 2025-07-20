
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, PlusCircle, Calculator, Save, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

const gradePoints: { [key: string]: number } = {
  'S': 10,
  'A': 9,
  'B': 8,
  'C': 7,
  'D': 6,
  'E': 5,
  'RA': 0,
};

const allGrades = Object.keys(gradePoints);

type Course = {
  id: number;
  grade: string;
  credits: string;
};

export default function CgpaCalculator() {
  const [courses, setCourses] = useState<Course[]>([{ id: 1, grade: '', credits: '' }]);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const addCourse = () => {
    setCourses([...courses, { id: Date.now(), grade: '', credits: '' }]);
  };

  const removeCourse = (id: number) => {
    setCourses(courses.filter(course => course.id !== id));
  };

  const handleCourseChange = (id: number, field: 'grade' | 'credits', value: string) => {
    setCourses(
      courses.map(course =>
        course.id === id ? { ...course, [field]: value } : course
      )
    );
  };

  const { cgpa, totalCredits, isValid } = useMemo(() => {
    let weightedSum = 0;
    let totalCredits = 0;
    
    const validCourses = courses.filter(course => {
        const credits = parseFloat(course.credits);
        const point = gradePoints[course.grade];
        return !isNaN(credits) && credits > 0 && point !== undefined;
    });

    if (validCourses.length === 0) {
      return { cgpa: '0.00', totalCredits: 0, isValid: false };
    }

    validCourses.forEach(course => {
      const credits = parseFloat(course.credits);
      const point = gradePoints[course.grade];
      weightedSum += point * credits;
      totalCredits += credits;
    });

    const cgpaValue = totalCredits > 0 ? (weightedSum / totalCredits).toFixed(2) : '0.00';
    return { cgpa: cgpaValue, totalCredits, isValid: true };
  }, [courses]);
  
  const handleSaveCgpa = async () => {
    if (!user) {
        toast({
            title: "Not Logged In",
            description: "You need to be logged in to save your CGPA.",
            variant: "destructive"
        });
        return;
    }
    if (!isValid) {
        toast({
            title: "Incomplete Data",
            description: "Please fill in valid grade and credit fields before saving.",
            variant: "destructive"
        });
        return;
    }
    
    setIsSaving(true);
    try {
        const docRef = doc(db, 'students_cgpa', user.uid);
        const coursesToSave = courses.filter(c => c.grade && c.credits && parseFloat(c.credits) > 0);

        await setDoc(docRef, {
            userId: user.uid,
            cgpa: parseFloat(cgpa),
            totalCredits,
            courses: coursesToSave.map(c => ({grade: c.grade, credits: parseFloat(c.credits) })),
            updatedAt: new Date().toISOString()
        });
        toast({
            title: "Success!",
            description: "Your CGPA has been saved successfully."
        });
    } catch (error) {
        console.error("Error saving CGPA: ", error);
        toast({
            title: "Error",
            description: "Could not save your CGPA. Please try again.",
            variant: "destructive"
        });
    } finally {
        setIsSaving(false);
    }
  };

  const selectedGrades = useMemo(() => new Set(courses.map(c => c.grade).filter(Boolean)), [courses]);

  return (
    <Card className="w-full shadow-lg transition-all duration-300 hover:shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-6 w-6 text-primary" />
          CGPA Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-[1fr_1fr_auto] gap-2 font-semibold text-sm text-muted-foreground px-1">
          <span>Grade</span>
          <span>Credits</span>
          <span />
        </div>
        <ScrollArea className="h-60 pr-4">
          <div className="space-y-2">
            {courses.map((course, index) => {
              const availableGrades = allGrades.filter(grade => !selectedGrades.has(grade) || grade === course.grade);
              return (
              <div key={course.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                <Select
                  value={course.grade} 
                  onValueChange={(value) => handleCourseChange(course.id, 'grade', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableGrades.map(grade => (
                      <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="e.g., 4"
                  value={course.credits}
                  onChange={(e) => handleCourseChange(course.id, 'credits', e.target.value)}
                  min="0"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCourse(course.id)}
                  disabled={courses.length === 1}
                  aria-label="Remove course"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              )
            })}
          </div>
        </ScrollArea>
        <Button variant="outline" size="sm" onClick={addCourse}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Course
        </Button>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center bg-secondary/50 p-4 rounded-b-lg gap-4 sm:gap-0">
        <div className="flex items-center gap-2">
            <Button onClick={handleSaveCgpa} disabled={!user || !isValid || isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                Save CGPA
            </Button>
            <div className="text-sm">
                <span className="font-semibold">Total Credits:</span> {totalCredits}
            </div>
        </div>
        <div className="text-center sm:text-right">
          <span className="text-sm font-semibold">Your CGPA</span>
          <p className="text-3xl font-bold text-primary">{cgpa}</p>
        </div>
      </CardFooter>
    </Card>
  );
}
