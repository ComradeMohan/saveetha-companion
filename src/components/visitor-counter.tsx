
'use client';

import { getVisitorCount, updateVisitCount } from '@/app/actions/analytics';
import { useEffect, useState } from 'react';
import { Skeleton } from './ui/skeleton';
import { Eye } from 'lucide-react';

export default function VisitorCounter() {
    const [count, setCount] = useState<number | null>(null);

    useEffect(() => {
        const key = 'last_visit_timestamp';
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        const lastVisit = localStorage.getItem(key);

        async function fetchAndIncrementCount() {
            try {
                const initialCount = await getVisitorCount();
                const newCount = initialCount + 1;
                setCount(newCount); // Display incremented count immediately
                await updateVisitCount(newCount); // Update the count in Firestore
                localStorage.setItem(key, now.toString());
            } catch (error) {
                console.error("Failed to update visitor count:", error);
                // Fallback to just displaying the fetched count if update fails
                if (count === null) { // only if we haven't set it yet
                    const initialCount = await getVisitorCount();
                    setCount(initialCount);
                }
            }
        }
        
        if (!lastVisit || (now - parseInt(lastVisit)) > oneHour) {
             fetchAndIncrementCount();
        } else {
            // If user has visited within the last hour, just fetch the count without incrementing
            async function fetchCount() {
                if (count === null) {
                    const currentCount = await getVisitorCount();
                    setCount(currentCount);
                }
            }
            fetchCount();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Eye className="h-4 w-4" />
            {count !== null ? (
                <span>Total Visitors: {count.toLocaleString()}</span>
            ) : (
                <Skeleton className="h-4 w-32" />
            )}
        </div>
    );
}
