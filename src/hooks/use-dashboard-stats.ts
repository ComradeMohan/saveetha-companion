
'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { subDays, startOfDay } from 'date-fns';

interface User {
  id: string;
  createdAt?: string;
  [key: string]: any;
}

interface Stats {
  totalUsers: {
    count: number;
    newToday: number;
  };
  conceptMaps: number;
  facultyCount: number;
  unreadMessages: number;
  userList: User[]; // Kept for potential future use, but not displayed directly
}

export default function useDashboardStats() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: { count: 0, newToday: 0 },
    conceptMaps: 0,
    facultyCount: 0,
    unreadMessages: 0,
    userList: [],
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const usersQuery = query(collection(db, 'users'));
    const conceptMapsQuery = query(collection(db, 'concept-maps'));
    const facultyQuery = query(collection(db, 'faculty'));
    const messagesQuery = query(collection(db, 'contact-messages'), where('status', '==', 'Unread'));

    const unsubscribers: (() => void)[] = [];
    let initialLoads = 4; // Number of collections we are loading

    const handleInitialLoad = () => {
        initialLoads--;
        if (initialLoads === 0) {
            setLoading(false);
        }
    }

    const handleError = (error: Error, type: string) => {
        console.error(`Error fetching ${type}:`, error);
        toast({
            title: 'Error',
            description: `Could not fetch ${type}.`,
            variant: 'destructive',
        });
        handleInitialLoad();
    }

    unsubscribers.push(onSnapshot(usersQuery, (snapshot) => {
      const usersData: User[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const now = new Date();
      const todayStart = startOfDay(now);

      let newToday = 0;
      usersData.forEach(user => {
        if (user.createdAt) {
          const createdAtDate = new Date(user.createdAt);
          if (createdAtDate >= todayStart) {
            newToday++;
          }
        }
      });

      setStats(prevStats => ({
        ...prevStats,
        totalUsers: {
          count: snapshot.size,
          newToday: newToday,
        },
        userList: usersData,
      }));
      handleInitialLoad();
    }, (e) => handleError(e, "user statistics")));

    unsubscribers.push(onSnapshot(conceptMapsQuery, (snapshot) => {
      setStats(prevStats => ({
        ...prevStats,
        conceptMaps: snapshot.size,
      }));
      handleInitialLoad();
    }, (e) => handleError(e, "concept map count")));

    unsubscribers.push(onSnapshot(facultyQuery, (snapshot) => {
        setStats(prevStats => ({
          ...prevStats,
          facultyCount: snapshot.size,
        }));
        handleInitialLoad();
      }, (e) => handleError(e, "faculty count")));

    unsubscribers.push(onSnapshot(messagesQuery, (snapshot) => {
        setStats(prevStats => ({
            ...prevStats,
            unreadMessages: snapshot.size,
        }));
        handleInitialLoad();
    }, (e) => handleError(e, "unread messages")));


    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [toast]);

  return { stats, loading };
}
