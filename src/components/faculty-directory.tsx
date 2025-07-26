
'use client';

import { useState, useMemo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import FacultyCard from './faculty-card';
import { Search, Users, Loader2, Type } from 'lucide-react';
import { type Faculty } from '@/lib/faculty-data';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { SuggestFacultyDialog } from './suggest-faculty-dialog';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { PlusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// In-memory cache for faculty data
let facultyCache: Faculty[] | null = null;

export default function FacultyDirectory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [firestoreFaculty, setFirestoreFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();


  const fetchFacultyData = useCallback(async () => {
    if (facultyCache) {
      setFirestoreFaculty(facultyCache);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
        const q = query(collection(db, 'faculty'), orderBy('name'));
        const querySnapshot = await getDocs(q);
        const data: Faculty[] = [];
        querySnapshot.forEach((doc) => {
            data.push({ id: doc.id, ...doc.data() } as Faculty);
        });
        facultyCache = data; // Cache the results
        setFirestoreFaculty(data);
    } catch (error) {
        console.error("Error fetching faculty data from Firestore:", error);
        toast({
            title: "Error",
            description: "Could not fetch faculty data.",
            variant: "destructive"
        });
    } finally {
        setLoading(false);
    }
  }, [toast]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const term = e.target.value;
      setSearchTerm(term);
      if (term && !hasSearched) {
          setHasSearched(true);
          fetchFacultyData();
      }
  };

  const filteredFaculty = useMemo(() => {
    if (!searchTerm || !hasSearched) {
      return [];
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    
    return firestoreFaculty.filter(
      faculty =>
        faculty.name.toLowerCase().includes(lowercasedFilter) ||
        (faculty.department && faculty.department.toLowerCase().includes(lowercasedFilter)) ||
        (faculty.phone && faculty.phone.includes(lowercasedFilter)) ||
        (faculty.subjects && faculty.subjects.some(subject => subject.toLowerCase().includes(lowercasedFilter))) ||
        (faculty.roomNo && faculty.roomNo.toLowerCase().includes(lowercasedFilter))
    );
  }, [searchTerm, firestoreFaculty, hasSearched]);
  
  const handleSuggestClick = () => {
    if (!user) {
        toast({
            title: "Authentication Required",
            description: "You need to be logged in to suggest a faculty member. Redirecting to login...",
            variant: "destructive"
        });
        setTimeout(() => router.push('/login'), 2000);
    }
    // If user is logged in, the dialog will open via its own trigger.
    // This function is only for the case when the user is not logged in.
  };

  return (
    <div>
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold tracking-tight">Faculty Directory</h2>
        <p className="text-muted-foreground mt-2">
            Search faculty by name, subject, department, or phone number.
        </p>
         <div className="mt-4">
            {user ? (
                <SuggestFacultyDialog onSuggestionAdded={() => {
                    // No action needed here for students
                }}/>
            ) : (
                 <Button variant="link" onClick={handleSuggestClick}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Missing Faculty
                </Button>
            )}
        </div>
      </div>
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Start typing to search faculty..."
          className="pl-10 w-full"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="flex flex-col">
                <CardHeader className="flex flex-row items-start gap-4 pb-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </CardHeader>
                <CardContent className="flex-grow space-y-3 text-sm">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))
        ) : hasSearched && searchTerm ? (
            filteredFaculty.length > 0 ? (
                filteredFaculty.map((faculty, index) => (
                    <FacultyCard key={faculty.id || `${faculty.name}-${index}`} faculty={faculty} />
                ))
            ) : (
                <div className="col-span-full text-center py-10">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">
                        No faculty members match your search.
                    </p>
                </div>
            )
        ) : (
             <div className="col-span-full text-center py-10">
                <Type className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">
                    Enter a name, subject, or department to begin your search.
                </p>
            </div>
        )}
       </div>
    </div>
  );
}
