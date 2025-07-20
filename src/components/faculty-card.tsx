
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Faculty } from '@/lib/faculty-data';
import { Phone, BookOpen, MapPin, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import Link from 'next/link';

export default function FacultyCard({ faculty }: { faculty: Faculty }) {
  const initials = faculty.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0,2);
    
  const getWhatsAppLink = (phone: string) => {
    let cleanPhone = phone.replace(/[^0-9]/g, '');
    // If it's a 10 digit number, assume it's an Indian number and add 91
    if (cleanPhone.length === 10) {
        cleanPhone = `91${cleanPhone}`;
    }
    return `https://wa.me/${cleanPhone}`;
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-start gap-4 pb-4">
        <Avatar className="h-12 w-12">
            <AvatarImage src={`https://placehold.co/100x100.png?text=${initials}`} alt={faculty.name} data-ai-hint="person portrait" />
            <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
            <CardTitle className="break-words">{faculty.name}</CardTitle>
            <CardDescription className="flex items-center gap-2 pt-1 truncate">
                <BookOpen className="h-4 w-4 flex-shrink-0" />
                <span>{faculty.department || 'N/A'}</span>
            </CardDescription>
        </div>
         <Button asChild variant="ghost" size="icon" className="flex-shrink-0">
            <Link href={getWhatsAppLink(faculty.phone)} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-5 w-5 text-green-500" />
                <span className="sr-only">Chat on WhatsApp</span>
            </Link>
        </Button>
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
