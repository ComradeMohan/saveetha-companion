
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const gradePoints: { [key: string]: number } = {
  S: 10,
  A: 9,
  B: 8,
  C: 7,
  D: 6,
  E: 5,
};

const grades = Object.keys(gradePoints);

type GradeCounts = {
  [key: string]: string;
};

export default function CgpaCalculator() {
  const [gradeCounts, setGradeCounts] = useState<GradeCounts>(
    grades.reduce((acc, grade) => ({ ...acc, [grade]: '' }), {})
  );
  
  const handleCountChange = (grade: string, value: string) => {
    // Only allow non-negative integers
    if (/^\d*$/.test(value)) {
      setGradeCounts(prev => ({ ...prev, [grade]: value }));
    }
  };

  const { cgpa, totalSubjects, totalCredits } = useMemo(() => {
    let weightedSum = 0;
    let totalSubjects = 0;

    for (const grade of grades) {
      const count = parseInt(gradeCounts[grade] || '0');
      if (count > 0) {
        const point = gradePoints[grade];
        weightedSum += point * count * 4; // Each subject is 4 credits
        totalSubjects += count;
      }
    }
    
    const totalCredits = totalSubjects * 4;
    const cgpaValue = totalCredits > 0 ? (weightedSum / totalCredits) : 0;

    return { cgpa: cgpaValue, totalSubjects, totalCredits };
  }, [gradeCounts]);


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
            {courses.map((course) => (
              <div key={course.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                <Select
                  value={course.grade} 
                  onValueChange={(value) => handleCourseChange(course.id, 'grade', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {allGrades.map(grade => (
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
            ))}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center bg-secondary/50 p-4 rounded-b-lg gap-4 sm:gap-2">
         <div className="text-center sm:text-left">
            <span className="text-sm font-semibold">Total Credits</span>
            <p className="text-xl font-bold">{totalCredits}</p>
        </div>
        <div className="text-center sm:text-right">
          <span className="text-sm font-semibold">Your CGPA</span>
          <p className="text-3xl font-bold text-primary">{cgpa.toFixed(2)}</p>
        </div>
      </CardFooter>
    </Card>
  );
}
