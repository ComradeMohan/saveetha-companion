
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { format, isWithinInterval, startOfDay, endOfDay, isFuture, isToday } from 'date-fns';
import { AddEventDialog } from '@/components/admin/add-event-dialog';
import type { Event } from '@/components/admin/add-event-dialog';
import { Loader2, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';

export default function AdminCalendarPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const today = startOfDay(new Date()).toISOString();
        const q = query(
            collection(db, 'events'), 
            where('startDate', '>=', today),
            orderBy('startDate', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const eventsData: Event[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                eventsData.push({
                    id: doc.id,
                    title: data.title,
                    startDate: data.startDate, 
                    endDate: data.endDate,
                    targetAudience: data.targetAudience,
                });
            });
            setEvents(eventsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching events:", error);
            toast({
                title: "Error",
                description: "Could not fetch events.",
                variant: "destructive"
            });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [toast]);

    const isDateInEventRange = (date: Date, event: Event) => {
        const startDate = startOfDay(new Date(event.startDate));
        const endDate = event.endDate ? endOfDay(new Date(event.endDate)) : startDate;
        return isWithinInterval(date, { start: startDate, end: endDate });
    };

    const displayedEvents = useMemo(() => {
        if (selectedDate) {
            return events.filter(e => isDateInEventRange(selectedDate, e));
        }
        // By default, show upcoming events (today or in the future)
        return events.filter(e => isToday(new Date(e.startDate)) || isFuture(new Date(e.startDate)));
    }, [selectedDate, events]);

     const handleDeleteClick = (event: Event) => {
        setEventToDelete(event);
        setIsAlertOpen(true);
    };

    const confirmDelete = async () => {
        if (!eventToDelete || !eventToDelete.id) return;

        try {
            await deleteDoc(doc(db, "events", eventToDelete.id));
            toast({
                title: "Success",
                description: "Event deleted successfully."
            });
        } catch (error) {
            console.error("Error deleting event:", error);
            toast({
                title: "Error",
                description: "Could not delete event.",
                variant: "destructive"
            });
        } finally {
            setIsAlertOpen(false);
            setEventToDelete(null);
        }
    };


    return (
        <>
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Events Calendar</h2>
                        <p className="text-muted-foreground">Manage academic and university events.</p>
                    </div>
                    <AddEventDialog />
                </div>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-[auto_1fr]">
                    <Card className="w-full max-w-sm mx-auto">
                        <CardContent className="p-2 md:p-4">
                             <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                className="p-0"
                                components={{
                                DayContent: ({ date }) => {
                                    const dayEvents = events.filter(e => isDateInEventRange(date, e));
                                    return (
                                    <div className="relative flex h-full w-full items-center justify-center">
                                        <span>{date.getDate()}</span>
                                        {dayEvents.length > 0 && (
                                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex space-x-0.5">
                                            {dayEvents.slice(0, 3).map((e, i) => (
                                                <div key={i} className="h-1.5 w-1.5 rounded-full bg-primary" />
                                            ))}
                                        </div>
                                        )}
                                    </div>
                                    );
                                },
                                }}
                            />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {selectedDate ? `Events for ${format(selectedDate, 'PPP')}` : 'Upcoming Events'}
                            </CardTitle>
                            <CardDescription>
                                {selectedDate ? 'Events scheduled for the selected date.' : 'A list of all upcoming events.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex justify-center items-center h-24">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                </div>
                            ) : displayedEvents.length > 0 ? (
                                <div className="space-y-4">
                                    {displayedEvents.map(event => (
                                        <div key={event.id} className="flex items-center justify-between gap-2 p-3 bg-secondary/50 rounded-lg">
                                            <div>
                                                <p className="font-semibold">{event.title}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {format(new Date(event.startDate), 'MMM d, yyyy')}
                                                    {event.endDate && ` - ${format(new Date(event.endDate), 'MMM d, yyyy')}`}
                                                </p>
                                                <Badge variant="outline" className="mt-1">{event.targetAudience}</Badge>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(event)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground py-10">
                                    <p>
                                        {selectedDate ? "No events for this day." : "No upcoming events."}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the event: <span className="font-semibold">{eventToDelete?.title}</span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
