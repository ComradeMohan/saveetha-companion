
'use client';

import { getVisitorCount } from '@/app/actions/analytics';
import { useEffect, useState } from 'react';
import { Skeleton } from './ui/skeleton';
import { Eye } from 'lucide-react';

export default function VisitorCounter() {
    const [count, setCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCount = async () => {
            setLoading(true);
            try {
                const visitorCount = await getVisitorCount();
                setCount(visitorCount);
            } catch (error) {
                console.error("Failed to fetch visitor count:", error);
                setCount(null);
            } finally {
                setLoading(false);
            }
        };

        fetchCount();
    }, []);

    return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Eye className="h-4 w-4" />
            {loading ? (
                <Skeleton className="h-4 w-32" />
            ) : count !== null ? (
                <span>Live Visitors: {count.toLocaleString()}</span>
            ) : (
                 <span>Error loading count</span>
            )}
        </div>
    );
}
