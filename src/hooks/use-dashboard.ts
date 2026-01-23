
'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, doc, getDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
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

const CACHE_KEY_PREFIX = 'dashboardData-';


export default function useDashboardData() {
    const { user } = useAuth();
    const [data, setData] = useState<DashboardData>({
        cgpa: null,
        nextEvent: null,
        daysUntilNextEvent: 0,
        updates: [],
    });
    const [loading, setLoading] = useState(true);

    const fetchAndCacheData = useCallback(async (userId: string) => {
        try {
            // Fetch all data in parallel
            const [cgpaSnap, eventsSnap, updatesSnap] = await Promise.all([
                getDoc(doc(db, 'students_cgpa', userId)),
                getDocs(query(
                    collection(db, 'events'),
                    where('startDate', '>=', startOfDay(new Date()).toISOString()),
                    orderBy('startDate', 'asc'),
                    limit(1)
                )),
                getDocs(query(collection(db, 'updates'), orderBy('createdAt', 'desc'), limit(5)))
            ]);

            // Process data
            const cgpaData = cgpaSnap.exists() ? (cgpaSnap.data() as CgpaData) : null;
            let nextEventData: Event | null = null;
            let daysUntil = 0;
            if (!eventsSnap.empty) {
                const eventDoc = eventsSnap.docs[0];
                nextEventData = { id: eventDoc.id, ...eventDoc.data() } as Event;
                daysUntil = differenceInDays(new Date(nextEventData.startDate), new Date());
            }
            const updatesData: Update[] = updatesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Update));
            
            const freshData: DashboardData = {
                cgpa: cgpaData,
                nextEvent: nextEventData,
                daysUntilNextEvent: daysUntil,
                updates: updatesData
            };
            
            // Set state and update cache
            setData(freshData);
            localStorage.setItem(`${CACHE_KEY_PREFIX}${userId}`, JSON.stringify(freshData));
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) {
            const cacheKey = `${CACHE_KEY_PREFIX}${user.uid}`;
            const cachedDataJSON = localStorage.getItem(cacheKey);

            if (cachedDataJSON) {
                try {
                    const cachedData = JSON.parse(cachedDataJSON);
                    setData(cachedData);
                    setLoading(false); // Show cached data immediately
                } catch (e) {
                    console.error("Failed to parse cached dashboard data:", e);
                    setLoading(true);
                }
            } else {
                 setLoading(true);
            }

            // Always fetch fresh data in the background
            fetchAndCacheData(user.uid);
            
        } else {
            setLoading(false);
        }
    }, [user, fetchAndCacheData]);

    return { data, loading };
}
