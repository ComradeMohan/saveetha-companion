
'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Award, ExternalLink, Search, School, LogIn } from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';

interface Certification {
    id: string;
    title: string;
    description: string;
    provider: string;
    url: string;
}

export default function CertificationsPage() {
    const { user, loading: authLoading } = useAuth();
    const [certifications, setCertifications] = useState<Certification[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();

    const fetchCertifications = useCallback(async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'certifications'), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            const data: Certification[] = [];
            snapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() } as Certification);
            });
            setCertifications(data);
        } catch (error) {
            console.error("Error fetching certifications:", error);
            toast({
                title: "Error",
                description: "Could not fetch certifications.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        if (user) {
            fetchCertifications();
        } else if (!authLoading) {
            setLoading(false);
        }
    }, [fetchCertifications, user, authLoading]);

    const filteredCerts = useMemo(() => {
        if (!searchTerm) return certifications;
        const lowercasedFilter = searchTerm.toLowerCase();
        return certifications.filter(cert =>
            cert.title.toLowerCase().includes(lowercasedFilter) ||
            cert.provider.toLowerCase().includes(lowercasedFilter) ||
            cert.description.toLowerCase().includes(lowercasedFilter)
        );
    }, [searchTerm, certifications]);

    const renderContent = () => {
        if (authLoading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            );
        }

        if (!user) {
            return (
                <Card className="max-w-md mx-auto text-center">
                    <CardHeader>
                        <CardTitle>Access Denied</CardTitle>
                        <CardDescription>You must be logged in to view free certifications.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/login"><LogIn className="mr-2 h-4 w-4" /> Log In to Continue</Link>
                        </Button>
                    </CardContent>
                </Card>
            );
        }

        return (
            <>
                <div className="relative mb-8 max-w-lg mx-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search by title, provider, or skill..."
                        className="pl-10 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : filteredCerts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCerts.map(cert => (
                            <Card key={cert.id} className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-primary/20 hover:-translate-y-1">
                                <CardHeader>
                                    <div className="flex items-start justify-between gap-4">
                                        <CardTitle className="text-lg leading-tight">{cert.title}</CardTitle>
                                        <div className="p-2 bg-secondary rounded-lg flex-shrink-0">
                                            <Award className="h-5 w-5 text-secondary-foreground" />
                                        </div>
                                    </div>
                                        <Badge variant="outline" className="self-start mt-1">
                                        <School className="h-3 w-3 mr-1.5" />
                                        {cert.provider}
                                    </Badge>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <CardDescription>{cert.description}</CardDescription>
                                </CardContent>
                                <div className="p-4 pt-0">
                                        <Button asChild className="w-full">
                                        <Link href={cert.url} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="mr-2 h-4 w-4" /> Go to Course
                                        </Link>
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-16">
                        <Award className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <p className="mt-4">No certifications found. Check back later!</p>
                    </div>
                )}
            </>
        );
    };

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 pt-20 pb-12 md:py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold tracking-tight">Free Certifications Hub</h2>
                        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                            Boost your resume and skills with these free certification courses from top companies and platforms.
                        </p>
                    </div>
                    
                    {renderContent()}
                </div>
            </main>
            <Footer />
        </div>
    );
}
