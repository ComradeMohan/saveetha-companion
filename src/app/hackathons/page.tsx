
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trophy, ArrowRight, Loader2, Search, Users, Clock, Tag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { TransformedHackathon } from '../api/hackathons/route';
import { cn } from '@/lib/utils';

// Function to determine the badge color based on time left
const getTimeBadgeVariant = (timeLeft: string): 'destructive' | 'default' | 'secondary' => {
    const lowerCaseTime = timeLeft.toLowerCase();
    if (lowerCaseTime.includes('day') || lowerCaseTime.includes('days')) {
        const days = parseInt(lowerCaseTime.split(' ')[0], 10);
        if (days < 7) return 'destructive';
        if (days < 30) return 'default';
    }
    return 'secondary';
};


export default function HackathonsPage() {
    const [hackathons, setHackathons] = useState<TransformedHackathon[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchHackathons = useCallback(async (page: number) => {
        console.log(`[fetchHackathons] Starting fetch for page: ${page}`);
        setLoading(true);
        try {
            const response = await fetch(`/api/hackathons?page=${page}`);
            if (!response.ok) {
                throw new Error('Failed to fetch hackathons');
            }
            const data = await response.json();
            console.log('[fetchHackathons] Data received:', data);
            setHackathons(data.hackathons);
            setCurrentPage(data.currentPage);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("[fetchHackathons] Fetch error:", error);
        } finally {
            setLoading(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, []);

    useEffect(() => {
        fetchHackathons(1);
    }, [fetchHackathons]);

    const handlePageChange = (newPage: number) => {
        console.log(`[handlePageChange] Changing to page: ${newPage}`);
        if (newPage >= 1 && newPage <= totalPages) {
            fetchHackathons(newPage);
        }
    };

    const filteredHackathons = useMemo(() => {
        const lowercasedFilter = searchTerm.toLowerCase();
        return hackathons.filter(h => 
            h.title.toLowerCase().includes(lowercasedFilter) ||
            h.organization.toLowerCase().includes(lowercasedFilter) ||
            h.themes.some(theme => theme.toLowerCase().includes(lowercasedFilter))
        );
    }, [searchTerm, hackathons]);

    const extractPrizeValue = (html: string) => {
        const match = html.match(/>\$([\d,]+)</);
        if (match && match[1]) return `$${match[1]}`;
        // Fallback for simple strings or if regex fails
        return html.replace(/<[^>]*>/g, '');
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 pt-20 pb-12 md:py-16">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold tracking-tight">Hackathons & Competitions</h2>
                        <p className="text-muted-foreground mt-2">
                            Discover upcoming hackathons, coding challenges, and innovation contests from Devpost.
                        </p>
                    </div>

                    <div className="relative mb-8">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search by title, organization, or theme..."
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
                        <div className="grid grid-cols-1 gap-6">
                            {filteredHackathons.map(hackathon => (
                                 <Card key={hackathon.id} className="group overflow-hidden transition-all duration-300 hover:shadow-primary/20 hover:-translate-y-1">
                                    <div className="flex flex-col sm:flex-row">
                                        <div className="flex-shrink-0">
                                            <Image
                                                src={hackathon.thumbnailUrl.startsWith('//') ? `https:${hackathon.thumbnailUrl}` : hackathon.thumbnailUrl}
                                                alt={hackathon.title}
                                                width={200}
                                                height={200}
                                                className="object-cover w-full sm:w-[200px] h-48 sm:h-[200px] transition-transform duration-300 group-hover:scale-105"
                                            />
                                        </div>
                                        <div className="flex flex-col flex-grow p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <Badge variant={hackathon.location === 'Online' ? 'default' : 'secondary'}>{hackathon.location}</Badge>
                                                <div className="text-right">
                                                    <p className="font-bold text-lg text-amber-500">{extractPrizeValue(hackathon.prizeAmount)}</p>
                                                    <p className="text-xs text-muted-foreground -mt-1">in prizes</p>
                                                </div>
                                            </div>
                                            <CardTitle className="text-lg leading-tight mb-1">{hackathon.title}</CardTitle>
                                            <p className="text-sm text-muted-foreground font-medium mb-3">{hackathon.organization}</p>
                                            
                                            <div className="flex-grow space-y-3">
                                                 <div className="flex flex-wrap gap-1.5">
                                                    {hackathon.themes.slice(0, 4).map(theme => (
                                                        <Badge key={theme} variant="outline" className="text-xs"><Tag className="h-3 w-3 mr-1"/>{theme}</Badge>
                                                    ))}
                                                </div>
                                                <div className="flex items-center text-sm text-muted-foreground gap-4">
                                                    <div className="flex items-center gap-1.5"><Users className="h-4 w-4"/> {hackathon.registrations.toLocaleString()} Participants</div>
                                                    <Badge variant={getTimeBadgeVariant(hackathon.timeLeft)}>
                                                        <Clock className="h-3 w-3 mr-1.5"/> {hackathon.timeLeft}
                                                    </Badge>
                                                </div>
                                            </div>
                                            
                                            <CardFooter className="p-0 pt-4 mt-auto">
                                                <Button asChild className="w-full">
                                                    <Link href={hackathon.url} target="_blank" rel="noopener noreferrer">
                                                        View Event <ArrowRight className="ml-2 h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </CardFooter>
                                        </div>
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

                    <div className="flex items-center justify-between mt-8">
                        <Button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage <= 1 || loading}
                        >
                            Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages || loading}
                        >
                            Next
                        </Button>
                    </div>

                </div>
            </main>
            <Footer />
        </div>
    );

    
}
