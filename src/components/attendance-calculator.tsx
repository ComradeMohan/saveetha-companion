'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Percent } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function AttendanceCalculator() {
  const [totalClasses, setTotalClasses] = useState('');
  const [attendedClasses, setAttendedClasses] = useState('');

  const percentage = useMemo(() => {
    const total = parseInt(totalClasses);
    const attended = parseInt(attendedClasses);

    if (isNaN(total) || isNaN(attended) || total <= 0 || attended < 0 || attended > total) {
      return 0;
    }
    return (attended / total) * 100;
  }, [totalClasses, attendedClasses]);

  const neededFor75 = useMemo(() => {
    const total = parseInt(totalClasses);
    const attended = parseInt(attendedClasses);

    if(isNaN(total) || isNaN(attended) || percentage >= 75) return "You're safe!";
    
    const needed = Math.ceil((0.75 * total - attended) / 0.25);
    if(needed <= 0) return "You're safe!";

    return `You need to attend the next ${needed} class${needed > 1 ? 'es' : ''} continuously.`;
  }, [totalClasses, attendedClasses, percentage]);

  return (
    <Card className="w-full shadow-lg transition-all duration-300 hover:shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Percent className="h-6 w-6 text-primary" />
          Attendance Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Enter your attendance details to see your current percentage.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="total-classes">Total Classes</Label>
            <Input
              id="total-classes"
              type="number"
              placeholder="e.g., 50"
              value={totalClasses}
              onChange={(e) => setTotalClasses(e.target.value)}
              min="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="attended-classes">Classes Attended</Label>
            <Input
              id="attended-classes"
              type="number"
              placeholder="e.g., 45"
              value={attendedClasses}
              onChange={(e) => setAttendedClasses(e.target.value)}
              min="0"
            />
          </div>
        </div>
        <div className="pt-4">
          <Progress value={percentage} className="w-full" />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-center justify-center bg-secondary/50 p-4 rounded-b-lg space-y-2">
        <div className="text-center">
            <span className="text-sm font-semibold">Your Attendance</span>
            <p className="text-3xl font-bold text-primary">{percentage.toFixed(1)}%</p>
        </div>
        <p className="text-sm text-muted-foreground text-center h-5">{neededFor75}</p>
      </CardFooter>
    </Card>
  );
}
