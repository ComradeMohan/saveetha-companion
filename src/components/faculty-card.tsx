import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Faculty } from '@/lib/faculty-data';
import { Phone, BookOpen, MapPin } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from './ui/badge';

export default function FacultyCard({ faculty }: { faculty: Faculty }) {
  const initials = faculty.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0,2);

  return (
    <Card className="hover:shadow-xl transition-all duration-300 flex flex-col">
      <CardHeader className="flex flex-row items-start gap-4 pb-4">
        <Avatar className="h-12 w-12">
            <AvatarImage src={`https://placehold.co/100x100.png?text=${initials}`} alt={faculty.name} data-ai-hint="person portrait" />
            <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
            <CardTitle>{faculty.name}</CardTitle>
            <CardDescription className="flex items-center gap-2 pt-1">
                <BookOpen className="h-4 w-4 flex-shrink-0" />
                <span>{faculty.department || 'N/A'}</span>
            </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="h-4 w-4 flex-shrink-0" />
          <span>{faculty.phone}</span>
        </div>
        {faculty.roomNo && faculty.roomNo.trim() && (
            <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>Room: {faculty.roomNo}</span>
            </div>
        )}
        {faculty.subjects && faculty.subjects.length > 0 && (
            <div className="pt-2">
                <h4 className="font-semibold mb-2">Subjects</h4>
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
