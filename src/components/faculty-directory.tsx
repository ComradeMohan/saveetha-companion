
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import FacultyCard from './faculty-card';
import { Search, Users, Loader2 } from 'lucide-react';
import { type Faculty } from '@/lib/faculty-data';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export default function FacultyDirectory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [firestoreFaculty, setFirestoreFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

   useEffect(() => {
        setLoading(true);
        const q = query(collection(db, 'faculty'), orderBy('name'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const data: Faculty[] = [];
            querySnapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() } as Faculty);
            });
            setFirestoreFaculty(data);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching faculty data from Firestore:", error);
            toast({
                title: "Error",
                description: "Could not fetch faculty data.",
                variant: "destructive"
            });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [toast]);

  const filteredFaculty = useMemo(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    
    if (!searchTerm) {
      return firestoreFaculty.slice(0, 6);
    }

    return firestoreFaculty.filter(
      faculty =>
        faculty.name.toLowerCase().includes(lowercasedFilter) ||
        (faculty.department && faculty.department.toLowerCase().includes(lowercasedFilter)) ||
        (faculty.phone && faculty.phone.includes(lowercasedFilter)) ||
        (faculty.subjects && faculty.subjects.some(subject => subject.toLowerCase().includes(lowercasedFilter))) ||
        (faculty.roomNo && faculty.roomNo.toLowerCase().includes(lowercasedFilter))
    );
  }, [searchTerm, firestoreFaculty]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold tracking-tight">Faculty Directory</h2>
        <p className="text-muted-foreground mt-2">
            Search faculty by name, subject, department, or phone number.
        </p>
      </div>
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search faculty..."
          className="pl-10 w-full"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>
      {loading ? (
        <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredFaculty.map((faculty, index) => (
                <FacultyCard key={faculty.id || `${faculty.name}-${index}`} faculty={faculty} />
            ))}
            {filteredFaculty.length === 0 && (
            <div className="col-span-full text-center py-10">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">No faculty members match your search.</p>
            </div>
            )}
        </div>
      )}
    </div>
  );
}
