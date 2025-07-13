'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, PlusCircle, Calculator } from 'lucide-react';

const gradePoints: { [key: string]: number } = {
  'O': 10,
  'A+': 9,
  'A': 8,
  'B': 7,
  'C': 6,
  'RA': 0,
};

type Course = {
  id: number;
  grade: string;
  credits: string;
};

export default function CgpaCalculator() {
  const [courses, setCourses] = useState<Course[]>([{ id: 1, grade: '', credits: '' }]);

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

  const { cgpa, totalCredits } = useMemo(() => {
    let weightedSum = 0;
    let totalCredits = 0;

    courses.forEach(course => {
      const credits = parseFloat(course.credits);
      const point = gradePoints[course.grade];

      if (!isNaN(credits) && credits > 0 && point !== undefined) {
        weightedSum += point * credits;
        totalCredits += credits;
      }
    });

    const cgpa = totalCredits > 0 ? (weightedSum / totalCredits).toFixed(2) : '0.00';
    return { cgpa, totalCredits };
  }, [courses]);

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-6 w-6 text-primary" />
          CGPA Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-[1fr_1fr_auto] gap-2 font-semibold text-sm text-muted-foreground">
          <span>Grade</span>
          <span>Credit Hours</span>
          <span></span>
        </div>
        <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
          {courses.map((course, index) => (
            <div key={course.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
              <Select onValueChange={(value) => handleCourseChange(course.id, 'grade', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Grade" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(gradePoints).map(grade => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="e.g., 3"
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
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={addCourse}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Course
        </Button>
      </CardContent>
      <CardFooter className="flex justify-between items-center bg-secondary/50 p-4 rounded-b-lg">
        <div className="text-sm">
          <span className="font-semibold">Total Credits:</span> {totalCredits}
        </div>
        <div className="text-right">
          <span className="text-sm font-semibold">Your CGPA</span>
          <p className="text-3xl font-bold text-primary">{cgpa}</p>
        </div>
      </CardFooter>
    </Card>
  );
}
