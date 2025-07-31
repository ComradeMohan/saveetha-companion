
'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { File as FileIcon, Lightbulb, Search, FileText } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { conceptMapFinder } from '@/ai/flows/concept-map-finder';
import type { ConceptMapFinderOutput } from '@/ai/flows/concept-map-finder';
import { Input } from './ui/input';
import { Card } from './ui/card';

export default function ConceptMapFinder() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ConceptMapFinderOutput>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    if (searchTerm.trim() === '') {
        setResults([]);
        setHasSearched(false);
        return;
    }

    const handler = setTimeout(async () => {
        setLoading(true);
        setHasSearched(true);
        const res = await conceptMapFinder({ query: searchTerm });
        setResults(res);
        setLoading(false);
    }, 500); // Debounce search

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold tracking-tight">Concept Map Library</h2>
        <p className="text-muted-foreground mt-2">
          Use AI to find the most relevant concept maps for your subjects.
        </p>
         <p className="text-sm text-muted-foreground mt-2">
          (Want to upload missing concept maps or files?{' '}
          <a
            href="https://saveetha-hub.netlify.app/file-manager"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:text-primary/80"
          >
            Upload here
          </a>
          )
        </p>
      </div>

      <div className="relative mb-8 max-w-lg mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search for a concept, e.g., 'data structures'"
          className="pl-10 w-full"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-4 rounded-lg border bg-card">
              <div className="flex flex-col justify-start items-start h-full space-y-4">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </Card>
          ))
        ) : hasSearched && results.length > 0 ? (
          results.map((map, index) => {
            const isPdf = map.url.toLowerCase().endsWith('.pdf');
            const href = isPdf ? `/view-pdf/${encodeURIComponent(map.url)}` : map.url;
            const target = isPdf ? '_self' : '_blank';
            const Icon = isPdf ? FileText : FileIcon;

            return (
              <Link
                key={map.title + index}
                href={href}
                target={target}
                rel={target === '_blank' ? 'noopener noreferrer' : ''}
                className={cn(
                  'group rounded-xl border bg-card p-4 text-card-foreground',
                  'transition-all duration-300 hover:shadow-primary/20 hover:border-primary/40 hover:-translate-y-1'
                )}
              >
                <div className="flex flex-col justify-start items-start h-full">
                  <div className="p-2 bg-secondary rounded-lg mb-4 transition-colors duration-300 group-hover:bg-primary">
                    <Icon className="h-6 w-6 text-primary transition-colors duration-300 group-hover:text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold text-base leading-tight flex-grow">{map.title}</h3>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="col-span-full text-center py-10">
            <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              {hasSearched ? 'No concept maps match your search.' : 'Start typing to find concept maps.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
