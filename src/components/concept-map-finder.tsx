
'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lightbulb, Search, Loader2, File as FileIcon } from 'lucide-react';
import { conceptMapFinder, type ConceptMapFinderOutput } from '@/ai/flows/concept-map-finder';
import { Skeleton } from './ui/skeleton';
import Link from 'next/link';
import { cn } from '@/lib/utils';

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
        <h2 className="text-3xl font-bold tracking-tight">Concept Map Finder</h2>
        <p className="text-muted-foreground mt-2">
          Find relevant concept maps for your subjects.
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading && Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 rounded-lg border bg-card/60 animate-pulse">
             <Skeleton className="h-8 w-8 mb-4 rounded-md" />
             <Skeleton className="h-4 w-3/4" />
             <Skeleton className="h-4 w-1/2 mt-2" />
          </div>
        ))}
        {!loading && searched && results.length === 0 && (
          <div className="col-span-full text-center py-10">
            <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">No concept maps found for your query.</p>
          </div>
        )}
        {!loading && results.map((map, index) => (
          <Link
            key={index}
            href={map.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
                "group rounded-lg border bg-card/50 p-4 text-card-foreground shadow-lg backdrop-blur-xl",
                "transition-all duration-300 hover:shadow-primary/20 hover:border-primary/40 hover:-translate-y-1"
            )}
          >
            <div className="flex flex-col justify-start items-start h-full">
                <div className="p-2 bg-primary/10 rounded-lg mb-4">
                    <FileIcon className="h-6 w-6 text-primary transition-colors duration-300 group-hover:text-primary-foreground group-hover:bg-primary/80 rounded-sm p-0.5" />
                </div>
                <h3 className="font-semibold text-base leading-tight">{map.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{map.description}</p>
            </div>
          </Link>
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
