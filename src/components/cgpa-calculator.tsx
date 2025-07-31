
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';

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
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

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
  
  const handleSave = async () => {
    if (!user) {
        toast({
            title: "Login Required",
            description: "Please log in to save your CGPA.",
            variant: "destructive"
        });
        return;
    }
    if (totalCredits === 0) {
        toast({
            title: "Cannot Save",
            description: "Please enter your grades before saving.",
            variant: "destructive"
        });
        return;
    }

    setIsSaving(true);
    try {
        const cgpaDocRef = doc(db, 'students_cgpa', user.uid);
        await setDoc(cgpaDocRef, {
            cgpa,
            totalCredits,
            updatedAt: new Date().toISOString()
        });
        setIsSaved(true);
        toast({
            title: "CGPA Saved!",
            description: "Your CGPA has been saved to your profile."
        });
    } catch (error) {
        console.error("Error saving CGPA:", error);
        toast({
            title: "Error",
            description: "Could not save your CGPA. Please try again.",
            variant: "destructive"
        });
    } finally {
        setIsSaving(false);
        setTimeout(() => setIsSaved(false), 2000);
    }
  };


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
          Enter the number of subjects for each grade. Your result will be saved automatically if you're logged in.
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
        {user && (
            <div className="pt-2">
                <Button onClick={handleSave} disabled={isSaving || isSaved}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSaved && <CheckCircle className="mr-2 h-4 w-4" />}
                    {isSaving ? 'Saving...' : isSaved ? 'Saved' : 'Save to Profile'}
                </Button>
            </div>
        )}
      </CardFooter>
    </Card>
  );
}

