
'use client';

import { incrementAndGetVisitorCount } from '@/app/actions/analytics';
import { useEffect, useState } from 'react';
import { Skeleton } from './ui/skeleton';
import { Eye } from 'lucide-react';

export default function VisitorCounter() {
    const [count, setCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const processVisit = async () => {
            setLoading(true);
            try {
                // Always increment the count on component mount (page load/refresh)
                const newCount = await incrementAndGetVisitorCount();
                setCount(newCount);
            } catch (error) {
                console.error("Failed to increment visitor count:", error);
                // If increment fails, try to just get the last known count
                try {
                    // This function is not available in the current context of analytics.ts, so we will just show an error state.
                    // For a real-world scenario, you might want a get-only function.
                    setCount(null); // Indicate an error state
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
            {loading ? (
                <Skeleton className="h-4 w-32" />
            ) : count !== null ? (
                <span>Total Visitors: {count.toLocaleString()}</span>
            ) : (
                 <span>Error loading count</span>
            )}
        </div>
    );
}
