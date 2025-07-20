
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, BookOpen, MessageSquare, Users, Loader2 } from 'lucide-react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    faculty: 0,
    conceptMaps: 0,
    unreadMessages: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const collections = {
      users: collection(db, 'users'),
      faculty: collection(db, 'faculty'),
      conceptMaps: collection(db, 'concept-maps'),
      unreadMessages: query(collection(db, 'contact-messages'), where('status', '==', 'Unread')),
    };

    const unsubscribes = Object.entries(collections).map(([key, collectionQuery]) => {
      return onSnapshot(
        collectionQuery,
        (snapshot) => {
          setStats((prevStats) => ({
            ...prevStats,
            [key]: snapshot.size,
          }));
          setLoading(false);
        },
        (error) => {
          console.error(`Error fetching ${key}:`, error);
          toast({
            title: 'Error',
            description: `Could not fetch ${key} count.`,
            variant: 'destructive',
          });
          setLoading(false);
        }
      );
    });

    // Cleanup listeners on component unmount
    return () => unsubscribes.forEach((unsub) => unsub());
  }, [toast]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{stats.users}</div>}
            <p className="text-xs text-muted-foreground">
              Total registered users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Faculty Members
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{stats.faculty}</div>}
            <p className="text-xs text-muted-foreground">
              Total faculty in directory
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concept Maps</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{stats.conceptMaps}</div>}
             <p className="text-xs text-muted-foreground">
              Total maps available
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contact Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{stats.unreadMessages}</div>}
            <p className="text-xs text-muted-foreground">
              Unread messages
            </p>
          </CardContent>
        </Card>
      </div>
      <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="space-y-8">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-muted-foreground mr-4"/>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    New user signed up.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    user@saveetha.com
                  </p>
                </div>
                <div className="ml-auto font-medium">2m ago</div>
              </div>
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-muted-foreground mr-4"/>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    New contact message.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    From: student@example.com
                  </p>
                </div>
                <div className="ml-auto font-medium">1h ago</div>
              </div>
               <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-muted-foreground mr-4"/>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    New concept map added.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Topic: "Data Structures"
                  </p>
                </div>
                <div className="ml-auto font-medium">3h ago</div>
              </div>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
