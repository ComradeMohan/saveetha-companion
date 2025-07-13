'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { facultyData } from '@/lib/faculty-data';
import FacultyCard from './faculty-card';
import { Search, Users } from 'lucide-react';

export default function FacultyDirectory() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFaculty = useMemo(() => {
    if (!searchTerm) {
      return facultyData;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    return facultyData.filter(
      faculty =>
        faculty.name.toLowerCase().includes(lowercasedFilter) ||
        faculty.department.toLowerCase().includes(lowercasedFilter) ||
        faculty.subjects.some(subject => subject.toLowerCase().includes(lowercasedFilter))
    );
  }, [searchTerm]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold tracking-tight">Faculty Directory</h2>
        <p className="text-muted-foreground mt-2">
            Search faculty by name, subject, or department. {facultyData.length} records found.
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredFaculty.map(faculty => (
          <FacultyCard key={faculty.name} faculty={faculty} />
        ))}
         {filteredFaculty.length === 0 && (
          <div className="col-span-full text-center py-10">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">No faculty members match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
