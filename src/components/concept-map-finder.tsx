
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Loader2, File as FileIcon, Lightbulb, Search, Upload } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import type { ConceptMap } from '@/lib/concept-map-data';
import { Input } from './ui/input';

let conceptMapCache: ConceptMap[] | null = null;

export default function ConceptMapFinder() {
  const [results, setResults] = useState<ConceptMap[]>(conceptMapCache || []);
  const [loading, setLoading] = useState(!conceptMapCache);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const fetchConceptMaps = useCallback(async () => {
    if (conceptMapCache) {
      setResults(conceptMapCache);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
        const q = query(collection(db, 'concept-maps'), orderBy('title'));
        const querySnapshot = await getDocs(q);
        const data: ConceptMap[] = [];
        querySnapshot.forEach((doc) => {
            data.push({ id: doc.id, ...doc.data() } as ConceptMap);
        });
        conceptMapCache = data; // Cache the results
        setResults(data);
    } catch (error) {
        console.error("Error fetching concept maps:", error);
        toast({
            title: "Error",
            description: "Could not fetch concept maps.",
            variant: "destructive"
        });
    } finally {
        setLoading(false);
    }
  }, [toast]);
  
  useEffect(() => {
    fetchConceptMaps();
  }, [fetchConceptMaps]);
  
  const filteredResults = useMemo(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    
    // If there's a search term, filter all results
    if (lowercasedTerm) {
        return results.filter(map => 
            map.title.toLowerCase().includes(lowercasedTerm)
        );
    }
    
    // Otherwise, show the first 6 by default
    return results.slice(0, 6);
  }, [searchTerm, results]);


  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold tracking-tight">Concept Map Library</h2>
        <p className="text-muted-foreground mt-2">
          Browse or search through the available concept maps for your subjects.
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
          placeholder="Search by name or subject..."
          className="pl-10 w-full"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading && Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-4 rounded-lg border bg-card">
                <Skeleton className="h-8 w-8 mb-4 rounded-md" />
                <Skeleton className="h-4 w-3/4" />
            </div>
        ))}
        {!loading && filteredResults.length === 0 && (
          <div className="col-span-full text-center py-10">
            <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
                {searchTerm ? "No concept maps match your search." : "No concept maps have been uploaded yet."}
            </p>
          </div>
        )}
        {!loading && filteredResults.map((map, index) => (
          <Link
            key={map.id || index}
            href={map.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
                "group rounded-xl border bg-card p-4 text-card-foreground",
                "transition-all duration-300 hover:shadow-primary/20 hover:border-primary/40 hover:-translate-y-1"
            )}
          >
            <div className="flex flex-col justify-start items-start h-full">
                <div className="p-2 bg-primary/10 rounded-lg mb-4">
                    <FileIcon className="h-6 w-6 text-primary transition-colors duration-300" />
                </div>
                <h3 className="font-semibold text-base leading-tight flex-grow">{map.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
