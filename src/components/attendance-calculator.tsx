
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Percent } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const TARGET_PERCENTAGE = 80;

export default function AttendanceCalculator() {
  const [attended, setAttended] = useState('');
  const [total, setTotal] = useState('');

  const handleAttendedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (/^\d{0,3}$/.test(e.target.value)) {
      setAttended(e.target.value);
    }
  };

  const handleTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     if (/^\d{0,3}$/.test(e.target.value)) {
      setTotal(e.target.value);
    }
  };
  
  const { percentage, message } = useMemo(() => {
    const attendedNum = parseInt(attended);
    const totalNum = parseInt(total);

    if (isNaN(attendedNum) || isNaN(totalNum) || totalNum <= 0 || attendedNum < 0 || attendedNum > totalNum) {
      return { percentage: 0, message: <span className="text-muted-foreground">Enter your class details above.</span> };
    }
    
    const currentPercentage = (attendedNum / totalNum) * 100;

    let statusMessage;
    if (currentPercentage >= TARGET_PERCENTAGE) {
      const bunkableClasses = Math.floor((attendedNum - (TARGET_PERCENTAGE / 100) * totalNum) / (TARGET_PERCENTAGE / 100));
      if (bunkableClasses > 0) {
        statusMessage = <span className="text-green-600 font-semibold">You can afford to miss the next {bunkableClasses} class{bunkableClasses > 1 ? 'es' : ''}.</span>;
      } else {
        statusMessage = <span className="text-green-600 font-semibold">You're safe, but don't miss any more classes!</span>;
      }
    } else {
      const neededClasses = Math.ceil(((TARGET_PERCENTAGE / 100) * totalNum - attendedNum) / (1 - (TARGET_PERCENTAGE / 100)));
      if (neededClasses > 0) {
        statusMessage = <span className="text-red-600 font-semibold">You need to attend the next {neededClasses} class{neededClasses > 1 ? 'es' : ''} to reach 80%.</span>;
      } else {
         statusMessage = <span className="text-green-600 font-semibold">You're safe!</span>;
      }
    }

    return { percentage: currentPercentage, message: statusMessage };
  }, [attended, total]);

  return (
    <Card className="w-full shadow-lg transition-all duration-300 hover:shadow-primary/10 hover:-translate-y-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Percent className="h-6 w-6 text-primary" />
            Attendance Calculator
        </CardTitle>
         <CardDescription>
          Calculate your attendance and see what it takes to reach 80%.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           <div className="space-y-2">
                <Label htmlFor="attended-classes">Classes Attended</Label>
                <Input
                    id="attended-classes"
                    type="number"
                    placeholder="e.g., 40"
                    value={attended}
                    onChange={handleAttendedChange}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="total-classes">Total Classes</Label>
                <Input
                    id="total-classes"
                    type="number"
                    placeholder="e.g., 50"
                    value={total}
                    onChange={handleTotalChange}
                />
            </div>
        </div>
      </CardContent>
       <CardFooter className="flex flex-col items-center justify-center bg-secondary/50 p-6 rounded-b-lg space-y-4">
        <div className="w-full text-center">
            <span className="text-sm font-semibold">Your Attendance</span>
            <p className="text-4xl font-bold text-primary">{percentage.toFixed(1)}%</p>
        </div>
        <Progress value={percentage > 100 ? 100 : percentage} className="w-full h-2" />
        <div className="text-center text-sm h-10 flex items-center justify-center">
            {message}
        </div>
      </CardFooter>
    </Card>
  );
}
