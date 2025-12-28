
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, CheckCircle, CloudOff } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { debounce } from 'lodash';

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
  const [isOnline, setIsOnline] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Check network status on component mount
    if (typeof navigator !== 'undefined') {
        setIsOnline(navigator.onLine);
    }
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleCountChange = (grade: string, value: string) => {
    if (/^\d{0,2}$/.test(value)) {
      setGradeCounts(prev => ({ ...prev, [grade]: value }));
      setIsSaved(false); // Reset saved state on change
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
  
  // Debounced auto-save function
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
  }, 2000), [isOnline, toast]); // Recreate debounce if isOnline or toast changes

  useEffect(() => {
    if (user && totalCredits > 0) {
        debouncedSave(cgpa, totalCredits, user);
    }
  }, [cgpa, totalCredits, user, debouncedSave]);

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
          Real-time CSE CGPA is computed from subject-wise grades in{" "}
          <Link href="/learn/courses" className="text-primary underline hover:opacity-80">
            Learn → Courses
          </Link>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
        <div className="pt-2 h-6">
          <StatusIndicator />
        </div>
      </CardFooter>
    </Card>
  );
}
