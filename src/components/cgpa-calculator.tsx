'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, Info } from 'lucide-react';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';

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
  const [usePreviousCgpa, setUsePreviousCgpa] = useState(false);
  const [previousCgpa, setPreviousCgpa] = useState('');
  const [previousSubjects, setPreviousSubjects] = useState('');

  const handleCountChange = (grade: string, value: string) => {
    if (/^\d{0,2}$/.test(value)) {
      setGradeCounts(prev => ({ ...prev, [grade]: value }));
    }
  };

  const { cgpa, totalSubjects, newSubjects } = useMemo(() => {
    let currentSumOfGradePoints = 0;
    let currentNewSubjects = 0;

    for (const grade of grades) {
      const count = parseInt(gradeCounts[grade] || '0');
      if (count > 0) {
        currentSumOfGradePoints += gradePoints[grade] * count;
        currentNewSubjects += count;
      }
    }
    
    if (usePreviousCgpa) {
        const prevCgpaNum = parseFloat(previousCgpa);
        const prevSubjectsNum = parseInt(previousSubjects);

        if (!isNaN(prevCgpaNum) && !isNaN(prevSubjectsNum) && prevSubjectsNum > 0) {
            const prevTotalPoints = prevCgpaNum * prevSubjectsNum;
            const overallTotalSubjects = prevSubjectsNum + currentNewSubjects;
            const overallTotalPoints = prevTotalPoints + currentSumOfGradePoints;
            
            const overallCgpa = overallTotalSubjects > 0 ? overallTotalPoints / overallTotalSubjects : 0;
            return { cgpa: overallCgpa, totalSubjects: overallTotalSubjects, newSubjects: currentNewSubjects };
        }
    }

    const cgpaValue = currentNewSubjects > 0 ? (currentSumOfGradePoints / currentNewSubjects) : 0;
    return { cgpa: cgpaValue, totalSubjects: currentNewSubjects, newSubjects: currentNewSubjects };

  }, [gradeCounts, usePreviousCgpa, previousCgpa, previousSubjects]);

  return (
    <Card className="w-full shadow-lg transition-all duration-300 hover:shadow-primary/10 hover:-translate-y-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-6 w-6 text-primary" />
          CGPA Calculator
        </CardTitle>
         <CardDescription>
          Enter your grades to calculate your current semester or overall CGPA.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-2">
          <Switch id="use-previous-cgpa" checked={usePreviousCgpa} onCheckedChange={setUsePreviousCgpa} />
          <Label htmlFor="use-previous-cgpa">Include Previous CGPA</Label>
        </div>

        {usePreviousCgpa && (
            <div className="p-4 bg-secondary/50 rounded-lg space-y-4 animate-in fade-in-50 duration-300">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="prev-cgpa">Previous CGPA</Label>
                        <Input id="prev-cgpa" type="number" placeholder="e.g., 8.5" value={previousCgpa} onChange={e => setPreviousCgpa(e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="prev-subjects">Subjects Completed</Label>
                        <Input id="prev-subjects" type="number" placeholder="e.g., 30" value={previousSubjects} onChange={e => setPreviousSubjects(e.target.value)} />
                    </div>
                </div>
                 <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Info className="h-4 w-4"/>Enter the new grades below. They will be added to your previous CGPA.</p>
            </div>
        )}

        <Separator />

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
            <span className="text-sm font-semibold">{usePreviousCgpa ? 'New Overall CGPA' : 'Your CGPA'}</span>
            <p className="text-4xl font-bold text-primary">{cgpa.toFixed(2)}</p>
        </div>
         <p className="text-sm text-muted-foreground text-center h-5">
            {usePreviousCgpa ? (
                <>
                Based on <span className="font-bold text-primary">{parseInt(previousSubjects) || 0}</span> previous + <span className="font-bold text-primary">{newSubjects}</span> new subjects.
                </>
            ) : (
                <>
                Based on <span className="font-bold text-primary">{totalSubjects}</span> subjects.
                </>
            )}
        </p>
      </CardFooter>
    </Card>
  );
}
