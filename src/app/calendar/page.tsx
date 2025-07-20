
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { format, isWithinInterval, startOfDay, endOfDay, isFuture, isToday } from 'date-fns';
import { Loader2, Filter, Calendar as CalendarIcon } from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Event = {
    id: string;
    title: string;
    startDate: string; // ISO string
    endDate?: string; // ISO string
    targetAudience: "All Years" | "1st Year" | "2nd Year" | "3rd Year" | "4th Year";
};

const audienceOptions = ["All Years", "1st Year", "2nd Year", "3rd Year", "4th Year"];

export default function StudentCalendarPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const { toast } = useToast();
    
    const [audienceFilter, setAudienceFilter] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('calendarAudienceFilter') || 'All Years';
        }
        return 'All Years';
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('calendarAudienceFilter', audienceFilter);
        }
    }, [audienceFilter]);

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
                eventsData.push({ id: doc.id, ...doc.data() } as Event);
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

    const filteredEvents = useMemo(() => {
        return events.filter(event => 
            audienceFilter === 'All Years' || 
            event.targetAudience === 'All Years' || 
            event.targetAudience === audienceFilter
        );
    }, [events, audienceFilter]);
    
    const isDateInEventRange = (date: Date, event: Event) => {
        const startDate = startOfDay(new Date(event.startDate));
        const endDate = event.endDate ? endOfDay(new Date(event.endDate)) : startDate;
        return isWithinInterval(date, { start: startDate, end: endDate });
    };

    const displayedEvents = useMemo(() => {
        if (selectedDate) {
            return filteredEvents.filter(e => isDateInEventRange(selectedDate, e));
        }
        // By default, show upcoming events (today or in the future)
        return filteredEvents.filter(e => {
            const eventStartDate = new Date(e.startDate);
            return isToday(eventStartDate) || isFuture(eventStartDate);
        });
    }, [selectedDate, filteredEvents]);


    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 py-12 md:py-16">
                 <div className="container mx-auto px-4">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold tracking-tight">University Events Calendar</h2>
                        <p className="text-muted-foreground mt-2">
                            Stay updated with all academic and university-wide events.
                        </p>
                    </div>
                    
                    <div className="flex justify-end mb-6">
                        <div className="w-full sm:w-auto sm:min-w-[200px]">
                            <Select value={audienceFilter} onValueChange={setAudienceFilter}>
                                <SelectTrigger>
                                    <Filter className="h-4 w-4 mr-2"/>
                                    <SelectValue placeholder="Filter by year..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {audienceOptions.map(option => (
                                        <SelectItem key={option} value={option}>
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
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
                                            const dayEvents = filteredEvents.filter(e => isDateInEventRange(date, e));
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
                                    {selectedDate ? 'A list of events for the selected date.' : 'All upcoming events.'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="flex justify-center items-center h-48">
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                    </div>
                                ) : displayedEvents.length > 0 ? (
                                    <div className="space-y-4">
                                        {displayedEvents.map(event => (
                                            <div key={event.id} className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                                                <div className="p-2 bg-primary/10 rounded-lg mt-1">
                                                     <CalendarIcon className="h-4 w-4 text-primary"/>
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{event.title}</p>
                                                    <p className="text-sm text-muted-foreground">{event.targetAudience}</p>
                                                     <p className="text-xs text-muted-foreground">
                                                        {format(new Date(event.startDate), 'MMM d, yyyy')}
                                                        {event.endDate && ` - ${format(new Date(event.endDate), 'MMM d, yyyy')}`}
                                                     </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-muted-foreground py-16">
                                        <p>
                                            {selectedDate ? 'No events scheduled for this day.' : 'No upcoming events found.'}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
