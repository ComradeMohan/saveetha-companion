
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, Bell, ExternalLink } from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';

interface Update {
    id: string;
    title: string;
    description: string;
    link?: string;
    createdAt: any;
}

export default function UpdatesPage() {
    const [updates, setUpdates] = useState<Update[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchUpdates = useCallback(async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'updates'), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            const updatesData: Update[] = [];
            snapshot.forEach((doc) => {
                updatesData.push({ id: doc.id, ...doc.data() } as Update);
            });
            setUpdates(updatesData);
        } catch (error) {
            console.error("Error fetching updates:", error);
            toast({
                title: "Error",
                description: "Could not fetch updates.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchUpdates();
    }, [fetchUpdates]);

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 py-12 md:py-16">
                <div className="container mx-auto px-4 max-w-3xl">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold tracking-tight">Updates & Announcements</h2>
                        <p className="text-muted-foreground mt-2">
                            The latest news and announcements from the university.
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Updates</CardTitle>
                            <CardDescription>
                                A list of all announcements.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex justify-center items-center h-48">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                </div>
                            ) : updates.length > 0 ? (
                                <div className="space-y-6">
                                    {updates.map(update => (
                                        <div key={update.id} className="flex items-start gap-4">
                                            <div className="p-3 bg-primary/10 rounded-full mt-1">
                                                <Bell className="h-5 w-5 text-primary"/>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-baseline">
                                                    <h3 className="font-semibold text-lg">{update.title}</h3>
                                                    <p className="text-xs text-muted-foreground flex-shrink-0 ml-4">
                                                        {update.createdAt ? formatDistanceToNow(update.createdAt.toDate(), { addSuffix: true }) : ''}
                                                    </p>
                                                </div>
                                                <p className="text-muted-foreground mt-1">{update.description}</p>
                                                {update.link && (
                                                    <Button asChild size="sm" className="mt-3">
                                                        <a href={update.link} target="_blank" rel="noopener noreferrer">
                                                            <ExternalLink className="mr-2 h-4 w-4" /> Open Link
                                                        </a>
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground py-16">
                                    <Bell className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                    <p className="mt-4">No updates posted yet.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
}

