import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Faculty } from '@/lib/faculty-data';
import { Phone, BookOpen } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function FacultyCard({ faculty }: { faculty: Faculty }) {
  const initials = faculty.name
    .split(' ')
    .map(n => n[0])
    .join('');

  return (
    <Card className="hover:shadow-xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-12 w-12">
            <AvatarImage src={`https://placehold.co/100x100.png?text=${initials}`} alt={faculty.name} data-ai-hint="person portrait" />
            <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
            <CardTitle>{faculty.name}</CardTitle>
            <CardDescription className="flex items-center gap-2 pt-1">
                <BookOpen className="h-4 w-4 flex-shrink-0" />
                <span>{faculty.department}</span>
            </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="h-4 w-4 flex-shrink-0" />
          <span>{faculty.phone}</span>
        </div>
      </CardContent>
    </Card>
  );
}
