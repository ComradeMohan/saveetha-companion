
'use client';

import { incrementAndGetVisitorCount, getVisitorCount } from '@/app/actions/analytics';
import { useEffect, useState } from 'react';
import { Skeleton } from './ui/skeleton';
import { Eye } from 'lucide-react';

export default function VisitorCounter() {
    const [count, setCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const key = 'session_visited';
        const sessionVisited = sessionStorage.getItem(key);

        const processVisit = async () => {
            setLoading(true);
            try {
                let newCount;
                if (!sessionVisited) {
                    // First visit in this session, increment the count
                    newCount = await incrementAndGetVisitorCount();
                    sessionStorage.setItem(key, 'true');
                } else {
                    // Already visited, just get the current count
                    newCount = await getVisitorCount();
                }
                setCount(newCount);
            } catch (error) {
                console.error("Failed to process visitor count:", error);
                // Attempt to get a stale count on error
                try {
                    const staleCount = await getVisitorCount();
                    setCount(staleCount);
                } catch (e) {
                    console.error("Failed to get stale visitor count:", e);
                }
            } finally {
                setLoading(false);
            }
        };

        processVisit();
    }, []);

    return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Eye className="h-4 w-4" />
            {loading || count === null ? (
                <Skeleton className="h-4 w-32" />
            ) : (
                <span>Total Visitors: {count.toLocaleString()}</span>
            )}
        </div>
    );
}
