
'use client';

import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Trash2, Percent, Calculator } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface Subject {
  id: string;
  name: string;
  totalClasses: string;
  attendedClasses: string;
}

const TARGET_PERCENTAGE = 80;

function AttendanceRow({ subject, onUpdate, onDelete }: { subject: Subject; onUpdate: (id: string, field: keyof Subject, value: string) => void; onDelete: (id: string) => void; }) {
  const { percentage, message } = useMemo(() => {
    const total = parseInt(subject.totalClasses);
    const attended = parseInt(subject.attendedClasses);

    if (isNaN(total) || isNaN(attended) || total <= 0 || attended < 0 || attended > total) {
      return { percentage: 0, message: <span className="text-muted-foreground">-</span> };
    }

    const currentPercentage = (attended / total) * 100;

    let statusMessage;
    if (currentPercentage >= TARGET_PERCENTAGE) {
      const bunkableClasses = Math.floor((attended - (TARGET_PERCENTAGE / 100) * total) / (TARGET_PERCENTAGE / 100));
      if (bunkableClasses > 0) {
        statusMessage = <span className="text-green-600">You can miss the next {bunkableClasses} class{bunkableClasses > 1 ? 'es' : ''}.</span>;
      } else {
        statusMessage = <span className="text-green-600">You're safe, don't miss!</span>;
      }
    } else {
      const neededClasses = Math.ceil(((TARGET_PERCENTAGE / 100) * total - attended) / (1 - (TARGET_PERCENTAGE / 100)));
      if (neededClasses > 0) {
        statusMessage = <span className="text-red-600">Attend next {neededClasses} class{neededClasses > 1 ? 'es' : ''}.</span>;
      } else {
        statusMessage = <span className="text-green-600">You're safe!</span>;
      }
    }

    return { percentage: currentPercentage, message: statusMessage };
  }, [subject.totalClasses, subject.attendedClasses]);

  return (
    <TableRow>
      <TableCell className="w-[150px] min-w-[150px]">
        <Input
          placeholder="Subject Name"
          value={subject.name}
          onChange={e => onUpdate(subject.id, 'name', e.target.value)}
          className="border-none px-1"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          placeholder="e.g., 50"
          value={subject.attendedClasses}
          onChange={e => onUpdate(subject.id, 'attendedClasses', e.target.value)}
          className="w-20 text-center border-none"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          placeholder="e.g., 40"
          value={subject.totalClasses}
          onChange={e => onUpdate(subject.id, 'totalClasses', e.target.value)}
          className="w-20 text-center border-none"
        />
      </TableCell>
      <TableCell className="text-center font-semibold">
        {percentage.toFixed(1)}%
      </TableCell>
      <TableCell className="text-center">{message}</TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="icon" onClick={() => onDelete(subject.id)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </TableCell>
    </TableRow>
  );
}


export default function SubjectWiseAttendanceCalculator() {
  const [subjects, setSubjects] = useState<Subject[]>([{ id: uuidv4(), name: '', totalClasses: '', attendedClasses: '' }]);

  const handleAddSubject = () => {
    setSubjects([...subjects, { id: uuidv4(), name: '', totalClasses: '', attendedClasses: '' }]);
  };

  const handleUpdateSubject = useCallback((id: string, field: keyof Subject, value: string) => {
    setSubjects(prevSubjects =>
      prevSubjects.map(subject =>
        subject.id === id ? { ...subject, [field]: value } : subject
      )
    );
  }, []);

  const handleDeleteSubject = useCallback((id: string) => {
    setSubjects(prevSubjects => prevSubjects.filter(subject => subject.id !== id));
  }, []);

  return (
    <Card className="w-full shadow-lg transition-all duration-300 hover:shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Percent className="h-6 w-6 text-primary" />
          Attendance Calculator
        </CardTitle>
        <CardDescription>Enter details for each subject to see your status (80% is required).</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-[150px]">Subject</TableHead>
                <TableHead>Attended</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-center">Percent</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {subjects.map(subject => (
                <AttendanceRow
                    key={subject.id}
                    subject={subject}
                    onUpdate={handleUpdateSubject}
                    onDelete={handleDeleteSubject}
                />
                ))}
            </TableBody>
            </Table>
        </div>
      </CardContent>
      <CardFooter className="flex justify-start p-4">
        <Button variant="outline" onClick={handleAddSubject}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Subject
        </Button>
      </CardFooter>
    </Card>
  );
}
