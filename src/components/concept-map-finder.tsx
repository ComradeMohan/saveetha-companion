
'use client';

import { useState, useEffect } from 'react';
import { Loader2, File as FileIcon, Lightbulb } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import type { ConceptMap } from '@/lib/concept-map-data';


export default function ConceptMapFinder() {
  const [results, setResults] = useState<ConceptMap[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'concept-maps'), orderBy('title'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const data: ConceptMap[] = [];
        querySnapshot.forEach((doc) => {
            data.push({ id: doc.id, ...doc.data() } as ConceptMap);
        });
        setResults(data);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching concept maps:", error);
        toast({
            title: "Error",
            description: "Could not fetch concept maps.",
            variant: "destructive"
        });
        setLoading(false);
    });

    return () => unsubscribe();
}, [toast]);


  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold tracking-tight">Concept Map Library</h2>
        <p className="text-muted-foreground mt-2">
          Browse through the available concept maps for your subjects.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading && Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="p-4 rounded-lg border bg-card/60">
             <Skeleton className="h-8 w-8 mb-4 rounded-md" />
             <Skeleton className="h-4 w-3/4" />
             <Skeleton className="h-4 w-1/2 mt-2" />
          </div>
        ))}
        {!loading && results.length === 0 && (
          <div className="col-span-full text-center py-10">
            <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">No concept maps have been uploaded yet.</p>
          </div>
        )}
        {!loading && results.map((map, index) => (
          <Link
            key={map.id || index}
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
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
