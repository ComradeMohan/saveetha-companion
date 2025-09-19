'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Briefcase, ArrowRight, Loader2, Search, MapPin, Globe, Clock, Tag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

interface TransformedJob {
  id: string;
  title: string;
  url: string;
  companyName: string;
  companyLogoUrl: string;
  category: string;
  tags: string[];
  jobType: string;
  publicationDate: string;
  location: string;
  salary: string;
}

const JobCardSkeleton = () => (
    <Card className="group overflow-hidden">
        <div className="p-6 flex gap-6">
            <div className="relative flex-shrink-0">
                 <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                    <Briefcase className="h-8 w-8 text-muted-foreground" />
                </div>
            </div>
            <div className="flex-1 space-y-3">
                 <div className="h-5 w-3/4 rounded bg-muted"></div>
                 <div className="h-4 w-1/2 rounded bg-muted"></div>
                 <div className="flex flex-wrap gap-2 pt-2">
                    <div className="h-5 w-16 rounded-full bg-muted"></div>
                    <div className="h-5 w-20 rounded-full bg-muted"></div>
                    <div className="h-5 w-12 rounded-full bg-muted"></div>
                 </div>
            </div>
        </div>
        <CardFooter className="bg-muted/50 p-3 flex justify-between items-center">
            <div className="h-5 w-24 rounded bg-muted-foreground/20"></div>
            <div className="h-9 w-28 rounded bg-muted-foreground/20"></div>
        </CardFooter>
    </Card>
)

export default function JobsPage() {
    const [jobs, setJobs] = useState<TransformedJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/jobs`);
            if (!response.ok) {
                throw new Error('Failed to fetch jobs');
            }
            const data = await response.json();
            setJobs(data.jobs);
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const filteredJobs = useMemo(() => {
        const lowercasedFilter = searchTerm.toLowerCase();
        if (!searchTerm) return jobs;
        
        return jobs.filter(j => 
            j.title.toLowerCase().includes(lowercasedFilter) ||
            j.companyName.toLowerCase().includes(lowercasedFilter) ||
            j.category.toLowerCase().includes(lowercasedFilter) ||
            j.tags.some(tag => tag.toLowerCase().includes(lowercasedFilter))
        );
    }, [searchTerm, jobs]);

    const formatJobType = (jobType: string) => {
        return jobType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 pt-20 pb-12 md:py-16">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold tracking-tight">Remote Jobs &amp; Internships</h2>
                        <p className="text-muted-foreground mt-2">
                            Discover remote opportunities from around the world, powered by the Remotive API.
                        </p>
                    </div>

                     <div className="relative mb-8">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search by title, company, or keyword..."
                            className="pl-10 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6">
                        {loading ? (
                            Array.from({length: 5}).map((_, i) => <JobCardSkeleton key={i} />)
                        ) : filteredJobs.length > 0 ? (
                            filteredJobs.map(job => (
                                <Card key={job.id} className="group overflow-hidden transition-all duration-300 hover:shadow-primary/20 hover:-translate-y-1">
                                    <div className="p-6 flex flex-col sm:flex-row gap-6">
                                        <div className="relative flex-shrink-0 h-16 w-16">
                                            <Image
                                                src={job.companyLogoUrl}
                                                alt={`${job.companyName} logo`}
                                                fill
                                                className="rounded-lg object-contain"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <CardTitle className="text-lg leading-tight mb-1">{job.title}</CardTitle>
                                            <p className="text-sm text-muted-foreground font-medium mb-3">{job.companyName}</p>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-3">
                                                 <div className="flex items-center gap-1.5"><Briefcase className="h-4 w-4"/> {job.category}</div>
                                                 <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4"/> {job.location || "Anywhere"}</div>
                                            </div>
                                             <div className="flex flex-wrap gap-1.5">
                                                {job.tags.slice(0, 4).map(tag => (
                                                    <Badge key={tag} variant="outline" className="text-xs"><Tag className="h-3 w-3 mr-1"/>{tag}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                     <CardFooter className="bg-muted/50 p-3 flex justify-between items-center">
                                        <div className="text-xs text-muted-foreground flex items-center gap-4">
                                            <span>{formatJobType(job.jobType)}</span>
                                            {job.salary && <span>•</span>}
                                            <span>{job.salary}</span>
                                        </div>
                                        <Button asChild size="sm">
                                            <Link href={job.url} target="_blank" rel="noopener noreferrer">
                                                View Job <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))
                        ) : (
                            <Card>
                                 <CardContent className="text-center py-16 text-muted-foreground">
                                    <Briefcase className="mx-auto h-12 w-12" />
                                    <p className="mt-4">No jobs match your search. Try a different keyword.</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}