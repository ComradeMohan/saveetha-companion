
'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, BellRing, Inbox } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
    id: string;
    title: string;
    description: string;
    createdAt: string;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notificationsData: Notification[] = [];
            snapshot.forEach((doc) => {
                notificationsData.push({ id: doc.id, ...doc.data() } as Notification);
            });
            setNotifications(notificationsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching notifications:", error);
            toast({
                title: "Error",
                description: "Could not fetch notifications.",
                variant: "destructive"
            });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [toast]);

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 py-12 md:py-16">
                <div className="container mx-auto px-4 max-w-3xl">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
                        <p className="text-muted-foreground mt-2">
                            A history of all announcements and updates.
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : notifications.length > 0 ? (
                        <div className="space-y-6">
                            {notifications.map((notif) => (
                                <Card key={notif.id} className="shadow-sm hover:shadow-md transition-shadow">
                                    <CardHeader className="flex flex-row items-start gap-4 pb-4">
                                         <div className="p-2 bg-primary/10 rounded-lg mt-1">
                                            <BellRing className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className='flex-1'>
                                            <CardTitle>{notif.title}</CardTitle>
                                            <CardDescription>
                                                {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                                            </CardDescription>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">{notif.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                         <div className="text-center text-muted-foreground py-20">
                            <Inbox className="mx-auto h-12 w-12" />
                            <p className="mt-4 text-lg">Your inbox is empty.</p>
                            <p>There are no notifications to display right now.</p>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
