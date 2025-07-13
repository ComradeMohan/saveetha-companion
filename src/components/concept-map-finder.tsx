'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Search, Loader2 } from 'lucide-react';
import { conceptMapFinder, type ConceptMapFinderOutput } from '@/ai/flows/concept-map-finder';
import Image from 'next/image';
import { Skeleton } from './ui/skeleton';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
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
    const searchResults = await conceptMapFinder({ query });
    // Simulate real search by using placeholders
    const placeholderResults = searchResults.map(r => ({
      ...r,
      url: `https://placehold.co/600x400.png`
    }))
    setResults(placeholderResults);
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

      <form action={handleSearch} className="flex gap-2 mb-8">
        <Input
          name="query"
          placeholder="Search for subjects or topics like 'Data Structures'..."
          className="flex-grow"
        />
        <SubmitButton />
      </form>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading && Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full mt-2" />
               <Skeleton className="h-4 w-1/2 mt-1" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full" />
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
          <Card key={index} className="overflow-hidden">
            <CardHeader>
              <CardTitle>{map.title}</CardTitle>
              <CardDescription>{map.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Image
                src={map.url}
                alt={map.title}
                width={600}
                height={400}
                className="rounded-md object-cover"
                data-ai-hint="concept map diagram"
              />
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
