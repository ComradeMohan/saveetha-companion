
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
    // Only allow non-negative integers up to 2 digits
    if (/^\d{0,2}$/.test(value)) {
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
    <Card className="w-full shadow-lg transition-all duration-300 hover:shadow-primary/10 hover:-translate-y-1">
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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {grades.map(grade => (
            <div key={grade} className="relative">
              <Label 
                htmlFor={`grade-${grade}`} 
                className="absolute left-0 top-0 flex h-full w-10 items-center justify-center rounded-l-md border-r bg-secondary font-bold text-secondary-foreground"
              >
                {grade}
              </Label>
              <Input
                id={`grade-${grade}`}
                type="number"
                placeholder="0"
                value={gradeCounts[grade]}
                onChange={e => handleCountChange(grade, e.target.value)}
                min="0"
                className="w-full pl-12 text-center text-lg h-12"
              />
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-center justify-center bg-secondary/50 p-4 rounded-b-lg space-y-2">
        <div className="text-center">
            <span className="text-sm font-semibold">Your CGPA</span>
            <p className="text-4xl font-bold text-primary">{cgpa.toFixed(2)}</p>
        </div>
        <p className="text-sm text-muted-foreground text-center h-5">
            Based on {totalSubjects} subjects and {totalCredits} credits.
        </p>
      </CardFooter>
    </Card>
  );
}
