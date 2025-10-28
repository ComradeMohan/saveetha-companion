
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Percent, Plus, Trash2, Book } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { AnimatePresence, motion } from 'framer-motion';

const TARGET_PERCENTAGE = 80;

interface Subject {
  id: number;
  name: string;
  attended: string;
  total: string;
}

const getAttendanceInfo = (attendedStr: string, totalStr: string) => {
  const attendedNum = parseInt(attendedStr);
  const totalNum = parseInt(totalStr);

  if (isNaN(attendedNum) || isNaN(totalNum) || totalNum <= 0 || attendedNum < 0 || attendedNum > totalNum) {
    return { percentage: 0, message: <span className="text-muted-foreground">Invalid input.</span> };
  }
  
  const currentPercentage = (attendedNum / totalNum) * 100;
  
  let statusMessage;
  if (currentPercentage >= TARGET_PERCENTAGE) {
    const bunkableClasses = Math.floor((attendedNum - (TARGET_PERCENTAGE / 100) * totalNum) / (TARGET_PERCENTAGE / 100));
    statusMessage = <span className="text-green-600 font-semibold">You can miss {bunkableClasses} class{bunkableClasses !== 1 ? 'es' : ''}.</span>;
  } else {
    const neededClasses = Math.ceil(((TARGET_PERCENTAGE / 100) * totalNum - attendedNum) / (1 - (TARGET_PERCENTAGE / 100)));
    statusMessage = <span className="text-red-600 font-semibold">Attend next {neededClasses} class{neededClasses !== 1 ? 'es' : ''}.</span>;
  }
  
  return { percentage: currentPercentage, message: statusMessage };
};


export default function SubjectWiseAttendanceCalculator() {
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    // This effect runs only on the client, avoiding hydration mismatch
    const savedSubjects = localStorage.getItem('attendanceSubjects');
    if (savedSubjects) {
      try {
        const parsed = JSON.parse(savedSubjects);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSubjects(parsed);
          return;
        }
      } catch (e) {
        console.error("Failed to parse saved subjects:", e);
      }
    }
    // If nothing in storage, set the initial default subject
    setSubjects([{ id: Date.now(), name: '', attended: '', total: '' }]);
  }, []); // Empty dependency array ensures this runs once on mount on the client

  useEffect(() => {
    // This effect saves to localStorage whenever subjects change
    if (subjects.length > 0 || localStorage.getItem('attendanceSubjects')) {
        localStorage.setItem('attendanceSubjects', JSON.stringify(subjects));
    }
  }, [subjects]);
  
  const addSubject = () => {
    setSubjects([...subjects, { id: Date.now(), name: '', attended: '', total: '' }]);
  };
  
  const removeSubject = (id: number) => {
    setSubjects(subjects.filter(subject => subject.id !== id));
  };
  
  const handleInputChange = (id: number, field: keyof Subject, value: string) => {
    setSubjects(subjects.map(subject =>
      subject.id === id ? { ...subject, [field]: value } : subject
    ));
  };
  
  return (
    <Card className="w-full shadow-lg transition-all duration-300 hover:shadow-primary/10 hover:-translate-y-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Percent className="h-6 w-6 text-primary" />
          Subject-Wise Attendance
        </CardTitle>
        <CardDescription>
          Add your subjects to track attendance and see what it takes to reach 80%.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 max-h-96 overflow-y-auto pr-4">
        <AnimatePresence>
            {subjects.map((subject, index) => {
                 const { percentage, message } = getAttendanceInfo(subject.attended, subject.total);
                 return (
                    <motion.div
                      key={subject.id}
                      layout
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3 }}
                      className="p-4 border rounded-lg bg-secondary/30 space-y-3"
                    >
                        <div className="flex justify-between items-start gap-2">
                           <div className="flex-1 space-y-1">
                                <Label htmlFor={`subject-name-${subject.id}`} className="flex items-center gap-1.5 text-xs text-muted-foreground"><Book className="h-3 w-3"/>Subject Name</Label>
                                <Input
                                    id={`subject-name-${subject.id}`}
                                    placeholder={`Subject ${index + 1}`}
                                    value={subject.name}
                                    onChange={(e) => handleInputChange(subject.id, 'name', e.target.value)}
                                    className="h-8 font-semibold"
                                />
                           </div>
                           <Button variant="ghost" size="icon" className="h-8 w-8 mt-5 text-destructive hover:bg-destructive/10" onClick={() => removeSubject(subject.id)}>
                                <Trash2 className="h-4 w-4" />
                           </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                           <div className="space-y-1">
                             <Label htmlFor={`attended-${subject.id}`} className="text-xs text-muted-foreground">Attended</Label>
                             <Input
                                id={`attended-${subject.id}`}
                                type="number"
                                placeholder="e.g., 40"
                                value={subject.attended}
                                onChange={(e) => handleInputChange(subject.id, 'attended', e.target.value)}
                                className="h-8"
                             />
                           </div>
                           <div className="space-y-1">
                             <Label htmlFor={`total-${subject.id}`} className="text-xs text-muted-foreground">Total</Label>
                              <Input
                                id={`total-${subject.id}`}
                                type="number"
                                placeholder="e.g., 50"
                                value={subject.total}
                                onChange={(e) => handleInputChange(subject.id, 'total', e.target.value)}
                                className="h-8"
                             />
                           </div>
                        </div>
                        
                         <div className="pt-2 space-y-1">
                            <Progress value={percentage > 100 ? 100 : percentage} className="h-2" />
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-semibold text-primary">{percentage.toFixed(1)}%</span>
                                <span className="text-muted-foreground">{message}</span>
                            </div>
                         </div>
                    </motion.div>
                )
            })}
        </AnimatePresence>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={addSubject}>
          <Plus className="mr-2 h-4 w-4" />
          Add Subject
        </Button>
      </CardFooter>
    </Card>
  );
}
