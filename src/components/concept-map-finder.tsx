
'use client';

import { useState, useMemo, useCallback } from 'react';
import { File as FileIcon, Lightbulb, Search, FileText, Loader2 } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ConceptMap } from '@/lib/concept-map-data';

// In-memory cache for concept maps to avoid re-fetching on every search
let conceptMapsCache: ConceptMap[] | null = null;

export default function ConceptMapFinder() {
  const [loading, setLoading] = useState(false);
  const [allMaps, setAllMaps] = useState<ConceptMap[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const fetchMaps = useCallback(async () => {
    if (conceptMapsCache) {
      setAllMaps(conceptMapsCache);
      return;
    }

    setLoading(true);
    try {
        const q = query(collection(db, 'concept-maps'), orderBy('title'));
        const querySnapshot = await getDocs(q);
        const mapsData: ConceptMap[] = [];
        querySnapshot.forEach((doc) => {
            mapsData.push({ id: doc.id, ...doc.data() } as ConceptMap);
        });
        conceptMapsCache = mapsData; // Cache the results
        setAllMaps(mapsData);
    } catch (error) {
        console.error("Error fetching concept maps:", error);
    } finally {
        setLoading(false);
    }
  }, []);

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.trim() !== '' && !conceptMapsCache) {
      // If user starts typing and cache is empty, fetch the maps
      setHasSearched(true);
      await fetchMaps();
    } else if (term.trim() === '') {
      // If search is cleared, hide results
      setHasSearched(false);
    } else {
      // If cache already exists, just show results
      setHasSearched(true);
    }
  };
  
  const filteredMaps = useMemo(() => {
    if (!hasSearched) {
      return []; // Don't show any maps if no search has been performed
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    return allMaps.filter(map => map.title.toLowerCase().includes(lowercasedFilter));
  }, [searchTerm, allMaps, hasSearched]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold tracking-tight">Concept Map Library</h2>
        <p className="text-muted-foreground mt-2">
          Use the search below to find concept maps for your subjects and courses.
        </p>
         <p className="text-sm text-muted-foreground mt-2">
          (Want to upload missing concept maps? Admins can add them in the dashboard.)
        </p>
      </div>

      <div className="relative mb-8 max-w-lg mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Start typing to search by title..."
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
        ) : hasSearched && filteredMaps.length > 0 ? (
          filteredMaps.map((map) => {
            const isPdf = map.url.toLowerCase().endsWith('.pdf');
            const href = isPdf ? `/view-pdf/${encodeURIComponent(map.url)}` : map.url;
            const target = isPdf ? '_self' : '_blank';
            const Icon = isPdf ? FileText : FileIcon;

            return (
              <Link
                key={map.id}
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
