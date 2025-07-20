
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { format, isSameDay } from 'date-fns';
import { Loader2, Filter, Calendar as CalendarIcon } from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Event = {
    id: string;
    title: string;
    date: string; // ISO string
    targetAudience: "All Years" | "1st Year" | "2nd Year" | "3rd Year" | "4th Year";
};

const audienceOptions = ["All Years", "1st Year", "2nd Year", "3rd Year", "4th Year"];

export default function StudentCalendarPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const { toast } = useToast();
    
    // State for filter, with lazy initialization from localStorage
    const [audienceFilter, setAudienceFilter] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('calendarAudienceFilter') || 'All Years';
        }
        return 'All Years';
    });

    useEffect(() => {
        // Persist filter to localStorage whenever it changes
        if (typeof window !== 'undefined') {
            localStorage.setItem('calendarAudienceFilter', audienceFilter);
        }
    }, [audienceFilter]);

    useEffect(() => {
        const q = query(collection(db, 'events'), orderBy('date', 'desc'));
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
    
    const eventsForSelectedDay = selectedDate ? filteredEvents.filter(e => isSameDay(new Date(e.date), selectedDate)) : [];

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

                    <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-[1fr_450px]">
                        <Card>
                             <CardContent className="p-2 md:p-4">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    className="p-0 [&_td]:w-full"
                                    components={{
                                        DayContent: ({ date }) => {
                                            const dayEvents = filteredEvents.filter(e => isSameDay(new Date(e.date), date));
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
                                    Events for {selectedDate ? format(selectedDate, 'PPP') : 'N/A'}
                                </CardTitle>
                                <CardDescription>Select a date to view scheduled events.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="flex justify-center items-center h-48">
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                    </div>
                                ) : eventsForSelectedDay.length > 0 ? (
                                    <div className="space-y-4">
                                        {eventsForSelectedDay.map(event => (
                                            <div key={event.id} className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                                                <div className="p-2 bg-primary/10 rounded-lg mt-1">
                                                     <CalendarIcon className="h-4 w-4 text-primary"/>
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{event.title}</p>
                                                    <p className="text-sm text-muted-foreground">{event.targetAudience}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-muted-foreground py-16">
                                        <p>No events scheduled for this day.</p>
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
