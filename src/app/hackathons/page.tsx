
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trophy, ArrowRight, Loader2, Search } from 'lucide-react';
import Link from 'next/link';

interface Hackathon {
  id: string;
  title: string;
  organization: string;
  date: string;
  mode: 'Online' | 'In-Person';
  location?: string;
  description: string;
  url: string;
}

export default function HackathonsPage() {
    const [hackathons, setHackathons] = useState<Hackathon[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchHackathons = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/hackathons');
            if (!response.ok) {
                throw new Error('Failed to fetch hackathons');
            }
            const data = await response.json();
            setHackathons(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHackathons();
    }, [fetchHackathons]);

    const filteredHackathons = useMemo(() => {
        const lowercasedFilter = searchTerm.toLowerCase();
        return hackathons.filter(h => 
            h.title.toLowerCase().includes(lowercasedFilter) ||
            h.organization.toLowerCase().includes(lowercasedFilter) ||
            h.description.toLowerCase().includes(lowercasedFilter)
        );
    }, [searchTerm, hackathons]);

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 pt-20 pb-12 md:py-16">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold tracking-tight">Hackathons & Competitions</h2>
                        <p className="text-muted-foreground mt-2">
                            Discover upcoming hackathons, coding challenges, and innovation contests.
                        </p>
                    </div>

                    <div className="relative mb-8">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search by title, organization, or keyword..."
                            className="pl-10 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    {loading ? (
                         <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : filteredHackathons.length > 0 ? (
                        <div className="space-y-6">
                            {filteredHackathons.map(hackathon => (
                                <Card key={hackathon.id} className="transition-all duration-300 hover:shadow-primary/20">
                                    <CardHeader className="flex flex-row items-start justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={hackathon.mode === 'Online' ? 'default' : 'secondary'}>{hackathon.mode}</Badge>
                                                <p className="text-sm text-muted-foreground">{hackathon.date}</p>
                                            </div>
                                            <CardTitle className="text-xl mt-1">{hackathon.title}</CardTitle>
                                            <CardDescription>{hackathon.organization}</CardDescription>
                                        </div>
                                        <div className="p-3 bg-secondary rounded-lg flex-shrink-0">
                                            <Trophy className="h-6 w-6 text-secondary-foreground" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground text-sm">{hackathon.description}</p>
                                    </CardContent>
                                    <div className="p-4 pt-0">
                                        <Button asChild>
                                            <Link href={hackathon.url} target="_blank" rel="noopener noreferrer">
                                                View Event <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                             <CardContent className="text-center py-16 text-muted-foreground">
                                <Trophy className="mx-auto h-12 w-12" />
                                <p className="mt-4">No hackathons match your search. Check back soon!</p>
                            </CardContent>
                        </Card>
                    )}

                </div>
            </main>
            <Footer />
        </div>
    );
}
