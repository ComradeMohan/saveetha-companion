
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calculator, CheckCircle, CloudOff, Info } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { debounce } from 'lodash';
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

  const [isOnline, setIsOnline] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
        setIsOnline(navigator.onLine);
    }
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleCountChange = (grade: string, value: string) => {
    if (/^\d{0,2}$/.test(value)) {
      setGradeCounts(prev => ({ ...prev, [grade]: value }));
      setIsSaved(false);
    }
  };

  const { cgpa, totalSubjects, totalCredits } = useMemo(() => {
    let newSumOfGradePoints = 0;
    let newSubjects = 0;

    for (const grade of grades) {
      const count = parseInt(gradeCounts[grade] || '0');
      if (count > 0) {
        newSumOfGradePoints += gradePoints[grade] * count;
        newSubjects += count;
      }
    }
    
    if (usePreviousCgpa) {
        const prevCgpaNum = parseFloat(previousCgpa);
        const prevSubjectsNum = parseInt(previousSubjects);

        if (!isNaN(prevCgpaNum) && !isNaN(prevSubjectsNum) && prevSubjectsNum > 0) {
            const prevTotalPoints = prevCgpaNum * prevSubjectsNum;
            const overallTotalSubjects = prevSubjectsNum + newSubjects;
            const overallTotalPoints = prevTotalPoints + newSumOfGradePoints;
            
            const overallCgpa = overallTotalSubjects > 0 ? overallTotalPoints / overallTotalSubjects : 0;
            return { cgpa: overallCgpa, totalSubjects: overallTotalSubjects, totalCredits: overallTotalSubjects * 4 }; // totalCredits is for backend sync
        }
    }

    const cgpaValue = newSubjects > 0 ? (newSumOfGradePoints / newSubjects) : 0;
    return { cgpa: cgpaValue, totalSubjects: newSubjects, totalCredits: newSubjects * 4 };

  }, [gradeCounts, usePreviousCgpa, previousCgpa, previousSubjects]);
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(debounce(async (cgpaToSave, creditsToSave, currentUser) => {
    if (!currentUser || creditsToSave === 0 || !isOnline) {
      return;
    }
    try {
      const cgpaDocRef = doc(db, 'students_cgpa', currentUser.uid);
      await setDoc(cgpaDocRef, {
        cgpa: cgpaToSave,
        totalCredits: creditsToSave,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      setIsSaved(true);
    } catch (error) {
      console.error("Auto-save CGPA Error:", error);
      toast({
        title: "Auto-save failed",
        description: "Could not sync your CGPA with the cloud.",
        variant: "destructive"
      });
    }
  }, 2000), [isOnline, toast]);

  useEffect(() => {
    if (user && totalSubjects > 0) {
        // totalCredits is used here for backend consistency, though calculation is subject-based
        debouncedSave(cgpa, totalCredits, user);
    }
  }, [cgpa, totalCredits, totalSubjects, user, debouncedSave]);

  const StatusIndicator = () => {
    if (!user) return null;
    if (!isOnline) {
      return <div className="flex items-center gap-1 text-xs text-muted-foreground"><CloudOff className="h-3 w-3 text-destructive" /> Offline</div>;
    }
    if (isSaved) {
      return <div className="flex items-center gap-1 text-xs text-green-600"><CheckCircle className="h-3 w-3" /> Saved</div>;
    }
    return <div className="flex items-center gap-1 text-xs text-muted-foreground"><div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></div> Syncing...</div>;
  };

  return (
    <Card className="w-full shadow-lg transition-all duration-300 hover:shadow-primary/10 hover:-translate-y-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-6 w-6 text-primary" />
          CGPA Calculator
        </CardTitle>
         <CardDescription>
          Real-time CGPA is computed from subject-wise grades in <Link href="/learn/courses" className="text-primary underline">Learn → Courses</Link>.
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
            {usePreviousCgpa ? `Based on ${parseInt(previousSubjects) || 0} previous + ${newSubjects} new subjects.` : `Based on ${totalSubjects} subjects.`}
        </p>
        <div className="pt-2 h-6">
          <StatusIndicator />
        </div>
      </CardFooter>
    </Card>
  );
}
