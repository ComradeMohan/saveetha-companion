'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator } from 'lucide-react';

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
      <CardContent className="space-y-6">
         <p className="text-sm text-muted-foreground -mt-2">
          Enter the number of subjects for each grade. Each subject is assumed to be 4 credits.
        </p>
        <div className="grid grid-cols-3 gap-4">
          {grades.map(grade => (
            <div key={grade} className="space-y-2">
              <Label htmlFor={`grade-${grade}`} className="text-lg font-bold">{grade}</Label>
              <Input
                id={`grade-${grade}`}
                type="number"
                placeholder="0"
                value={gradeCounts[grade]}
                onChange={e => handleCountChange(grade, e.target.value)}
                min="0"
                className="text-center"
              />
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center bg-secondary/50 p-4 rounded-b-lg gap-4 sm:gap-2">
         <div className="text-center sm:text-left">
            <span className="text-sm font-semibold">Total Subjects</span>
            <p className="text-xl font-bold">{totalSubjects}</p>
        </div>
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
