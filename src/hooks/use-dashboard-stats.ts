
'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { subDays, startOfDay, endOfDay } from 'date-fns';

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
  weeklySignups: number;
  monthlySignups: number;
  conceptMaps: number;
  userList: User[];
}

export default function useDashboardStats() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: { count: 0, newToday: 0 },
    weeklySignups: 0,
    monthlySignups: 0,
    conceptMaps: 0,
    userList: [],
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const usersQuery = query(collection(db, 'users'));
    const conceptMapsQuery = query(collection(db, 'concept-maps'));

    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const usersData: User[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const now = new Date();
      const todayStart = startOfDay(now);
      const weekStart = startOfDay(subDays(now, 6)); // Last 7 days including today
      const monthStart = startOfDay(subDays(now, 29)); // Last 30 days including today

      let newToday = 0;
      let weeklySignups = 0;
      let monthlySignups = 0;

      usersData.forEach(user => {
        if (user.createdAt) {
          const createdAtDate = new Date(user.createdAt);
          if (createdAtDate >= todayStart) {
            newToday++;
          }
          if (createdAtDate >= weekStart) {
            weeklySignups++;
          }
          if (createdAtDate >= monthStart) {
            monthlySignups++;
          }
        }
      });

      setStats(prevStats => ({
        ...prevStats,
        totalUsers: {
          count: snapshot.size,
          newToday: newToday,
        },
        weeklySignups,
        monthlySignups,
        userList: usersData,
      }));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching users:", error);
      toast({
        title: 'Error',
        description: 'Could not fetch user statistics.',
        variant: 'destructive',
      });
      setLoading(false);
    });

    const unsubscribeConceptMaps = onSnapshot(conceptMapsQuery, (snapshot) => {
      setStats(prevStats => ({
        ...prevStats,
        conceptMaps: snapshot.size,
      }));
    }, (error) => {
        console.error("Error fetching concept maps:", error);
        toast({
            title: 'Error',
            description: 'Could not fetch concept map count.',
            variant: 'destructive',
        });
    });

    return () => {
      unsubscribeUsers();
      unsubscribeConceptMaps();
    };
  }, [toast]);

  return { stats, loading };
}
