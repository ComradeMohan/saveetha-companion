
'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getCountFromServer, getDocs, doc, getDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { startOfDay, differenceInDays } from 'date-fns';

interface CgpaData {
    cgpa: number;
    totalCredits: number;
}

interface Event {
    id: string;
    title: string;
    startDate: string; // ISO string
}

interface Update {
    id: string;
    title: string;
    createdAt: any; // Firestore timestamp
}

interface DashboardData {
    cgpa: CgpaData | null;
    nextEvent: Event | null;
    daysUntilNextEvent: number;
    updates: Update[];
}

export default function useDashboardData() {
    const { user } = useAuth();
    const [data, setData] = useState<DashboardData>({
        cgpa: null,
        nextEvent: null,
        daysUntilNextEvent: 0,
        updates: [],
    });
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchDashboardData = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            // Fetch CGPA, next event, and updates in parallel
            const [cgpaSnap, eventsSnap, updatesSnap] = await Promise.all([
                getDoc(doc(db, 'students_cgpa', user.uid)),
                getDocs(query(
                    collection(db, 'events'),
                    where('startDate', '>=', startOfDay(new Date()).toISOString()),
                    orderBy('startDate', 'asc'),
                    limit(1)
                )),
                getDocs(query(collection(db, 'updates'), orderBy('createdAt', 'desc'), limit(5)))
            ]);

            // Process CGPA data
            const cgpaData = cgpaSnap.exists() ? (cgpaSnap.data() as CgpaData) : null;

            // Process event data
            let nextEventData: Event | null = null;
            let daysUntil = 0;
            if (!eventsSnap.empty) {
                const eventDoc = eventsSnap.docs[0];
                nextEventData = { id: eventDoc.id, ...eventDoc.data() } as Event;
                daysUntil = differenceInDays(new Date(nextEventData.startDate), new Date());
            }

            // Process updates data
            const updatesData: Update[] = updatesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Update));

            setData({
                cgpa: cgpaData,
                nextEvent: nextEventData,
                daysUntilNextEvent: daysUntil,
                updates: updatesData
            });

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            toast({
                title: 'Error',
                description: 'Could not load your dashboard. Please try again later.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }, [user, toast]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    return { data, loading };
}
