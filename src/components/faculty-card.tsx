
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Faculty } from '@/lib/faculty-data';
import { Phone, BookOpen, MapPin, Copy, Check } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

export default function FacultyCard({ faculty }: { faculty: Faculty }) {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const initials = faculty.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0,2);
    
  const handleCopy = () => {
    navigator.clipboard.writeText(faculty.phone).then(() => {
      setIsCopied(true);
      toast({
        title: "Copied!",
        description: `${faculty.name}'s phone number has been copied to your clipboard.`,
      });
      setTimeout(() => setIsCopied(false), 2000); // Reset icon after 2 seconds
    }, (err) => {
      console.error('Could not copy text: ', err);
       toast({
        title: "Error",
        description: "Failed to copy phone number.",
        variant: "destructive",
      });
    });
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-start gap-4 pb-4">
        <Avatar className="h-10 w-10">
            <AvatarImage src={`https://placehold.co/100x100.png?text=${initials}`} alt={faculty.name} data-ai-hint="person portrait" />
            <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
            <CardTitle className="break-words text-lg md:text-xl">{faculty.name}</CardTitle>
            <CardDescription className="flex items-center gap-2 pt-1 truncate text-sm">
                <BookOpen className="h-4 w-4 flex-shrink-0" />
                <span>{faculty.department || 'N/A'}</span>
            </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-3 text-sm">
        <div className="flex items-center justify-between gap-2 text-muted-foreground">
            <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>{faculty.phone}</span>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
                {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                <span className="sr-only">Copy phone number</span>
            </Button>
        </div>
        {faculty.roomNo && faculty.roomNo.trim() && (
            <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>Room: {faculty.roomNo}</span>
            </div>
        )}
        {faculty.subjects && faculty.subjects.length > 0 && (
            <div className="pt-2">
                <h4 className="font-semibold mb-2 text-sm">Subjects</h4>
                <div className="flex flex-wrap gap-2">
                    {faculty.subjects.map(subject => (
                        <Badge key={subject} variant="secondary">{subject}</Badge>
                    ))}
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
