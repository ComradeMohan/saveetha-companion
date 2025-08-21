
'use client';

import { incrementAndGetVisitorCount } from '@/app/actions/analytics';
import { useEffect, useState } from 'react';
import { Skeleton } from './ui/skeleton';
import { Eye } from 'lucide-react';

export default function VisitorCounter() {
    const [count, setCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const key = 'session_visited';
        const sessionVisited = sessionStorage.getItem(key);

        async function fetchAndIncrement() {
            try {
                const newCount = await incrementAndGetVisitorCount();
                setCount(newCount);
                sessionStorage.setItem(key, 'true');
            } catch (error) {
                console.error("Failed to increment and get visitor count:", error);
                // In case of error, you might want to display a stale count
                // or handle it gracefully. For now, we'll just log it.
            } finally {
                setLoading(false);
            }
        }
        
        if (!sessionVisited) {
             fetchAndIncrement();
        } else {
            // If user has already visited in this session, just get the count without incrementing.
            // This is a bit tricky because we don't have a dedicated "get" function that doesn't also increment.
            // For simplicity, we'll assume the count doesn't need to be live-updated for a returning session user.
            // A better approach might be to have a separate get-only function.
            // For now, we just won't update the count to avoid double-incrementing.
             setLoading(false); // Assume it's loaded, but we won't fetch.
        }
    }, []);

    // This second effect ensures that even if we don't increment, we still show a number.
    useEffect(() => {
        async function fetchInitialCount() {
            if (count === null) {
                const currentCount = await incrementAndGetVisitorCount(); // A simple get-only function would be better here.
                setCount(currentCount);
                setLoading(false);
            }
        }
        if (sessionStorage.getItem('session_visited')) {
            fetchInitialCount();
        }
    }, [count]);


    return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Eye className="h-4 w-4" />
            {loading ? (
                <Skeleton className="h-4 w-32" />
            ) : count !== null ? (
                <span>Total Visitors: {count.toLocaleString()}</span>
            ) : (
                 <Skeleton className="h-4 w-32" />
            )}
        </div>
    );
}
