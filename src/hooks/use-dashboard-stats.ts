
'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getCountFromServer, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { startOfDay } from 'date-fns';

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
  userList: User[];
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

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
        const usersCol = collection(db, 'users');
        const conceptMapsCol = collection(db, 'concept-maps');
        const facultyCol = collection(db, 'faculty');
        const messagesCol = collection(db, 'contact-messages');
        const todayStart = startOfDay(new Date());

        // Batch count queries
        const [
            usersSnapshot,
            conceptMapsSnapshot,
            facultySnapshot,
            unreadMessagesSnapshot
        ] = await Promise.all([
            getCountFromServer(usersCol),
            getCountFromServer(conceptMapsCol),
            getCountFromServer(facultyCol),
            getCountFromServer(query(messagesCol, where('status', '==', 'Unread')))
        ]);

        // Fetch user list for chart (can be further optimized with pagination if needed)
        const userListQuery = query(collection(db, 'users'));
        const userListSnapshot = await getDocs(userListQuery);
        const userList: User[] = userListSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        let newToday = 0;
        userList.forEach(user => {
            if (user.createdAt) {
                const createdAtDate = new Date(user.createdAt);
                if (createdAtDate >= todayStart) {
                    newToday++;
                }
            }
        });

        setStats({
            totalUsers: {
                count: usersSnapshot.data().count,
                newToday: newToday,
            },
            conceptMaps: conceptMapsSnapshot.data().count,
            facultyCount: facultySnapshot.data().count,
            unreadMessages: unreadMessagesSnapshot.data().count,
            userList: userList,
        });

    } catch (error: any) {
        console.error("Error fetching dashboard stats:", error);
        toast({
            title: 'Error',
            description: `Could not fetch dashboard statistics. ${error.code === 'permission-denied' ? 'Please check Firestore rules.' : ''}`,
            variant: 'destructive',
        });
    } finally {
        setLoading(false);
    }
  }, [toast]);
  
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading };
}
