
'use client';

import { getVisitorCount } from '@/app/actions/analytics';
import { useEffect, useState } from 'react';
import { Skeleton } from './ui/skeleton';
import { Eye } from 'lucide-react';

export default function VisitorCounter() {
    const [count, setCount] = useState<number | null>(null);

    useEffect(() => {
        async function fetchCount() {
            const visitorCount = await getVisitorCount();
            setCount(visitorCount);
        }
        fetchCount();
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
