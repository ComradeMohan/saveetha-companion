
'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Search, Loader2, ExternalLink } from 'lucide-react';
import { conceptMapFinder, type ConceptMapFinderOutput } from '@/ai/flows/concept-map-finder';
import { Skeleton } from './ui/skeleton';
import Link from 'next/link';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Searching...
        </>
      ) : (
        <>
          <Search className="mr-2 h-4 w-4" />
          Search
        </>
      )}
    </Button>
  );
}

export default function ConceptMapFinder() {
  const [results, setResults] = useState<ConceptMapFinderOutput>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (formData: FormData) => {
    const query = formData.get('query') as string;
    if (!query) return;

    setLoading(true);
    setSearched(true);
    setResults([]); // Clear previous results
    const searchResults = await conceptMapFinder({ query });
    setResults(searchResults);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold tracking-tight">AI Concept Map Finder</h2>
        <p className="text-muted-foreground mt-2">
          Let our AI assistant help you find relevant concept maps for your subjects.
        </p>
      </div>

      <form action={handleSearch} className="flex flex-col sm:flex-row gap-2 mb-8">
        <Input
          name="query"
          placeholder="Search for subjects or topics like 'Data Structures'..."
          className="flex-grow"
        />
        <SubmitButton />
      </form>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading && Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full mt-2" />
               <Skeleton className="h-4 w-1/2 mt-1" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
        {!loading && searched && results.length === 0 && (
          <div className="col-span-full text-center py-10">
            <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">No concept maps found for your query.</p>
          </div>
        )}
        {!loading && results.map((map, index) => (
          <Card key={index} className="overflow-hidden transition-all duration-300 hover:shadow-xl animate-fade-in flex flex-col">
            <CardHeader className="flex-grow">
              <CardTitle>{map.title}</CardTitle>
              <CardDescription>{map.description}</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild className="w-full">
                    <Link href={map.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open Concept Map
                    </Link>
                </Button>
            </CardContent>
          </Card>
        ))}
        {!loading && !searched && (
            <div className="col-span-full text-center py-10">
                <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">Start by searching for a topic.</p>
            </div>
        )}
      </div>
    </div>
  );
}
