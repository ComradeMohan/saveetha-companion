
'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { collection, query, orderBy, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, LogIn, PlusCircle, FolderKanban, Link as LinkIcon, Instagram, Github,Linkedin, Globe } from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AddPddProjectDialog } from '@/components/pdd/add-pdd-project-dialog';
import type { PDDProject } from '@/types/pdd-project';
import { PddProjectLinks } from '@/components/pdd/pdd-project-links';

export default function PddProjectsPage() {
    const { user, loading: authLoading } = useAuth();
    const [projects, setProjects] = useState<PDDProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();

    const fetchProjects = useCallback(() => {
        setLoading(true);
        const q = query(collection(db, 'pdd-projects'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const projectsData: PDDProject[] = [];
            snapshot.forEach((doc) => {
                projectsData.push({ id: doc.id, ...doc.data() } as PDDProject);
            });
            setProjects(projectsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching projects:", error);
            toast({
                title: "Error",
                description: "Could not fetch projects.",
                variant: "destructive"
            });
            setLoading(false);
        });
        return unsubscribe;
    }, [toast]);

    useEffect(() => {
        if (user) {
            const unsubscribe = fetchProjects();
            return () => unsubscribe();
        } else if (!authLoading) {
            setLoading(false);
        }
    }, [fetchProjects, user, authLoading]);

    const filteredProjects = useMemo(() => {
        const lowercasedFilter = searchTerm.toLowerCase();
        if (!lowercasedFilter) return projects;
        return projects.filter(project =>
            project.title.toLowerCase().includes(lowercasedFilter) ||
            project.userName.toLowerCase().includes(lowercasedFilter)
        );
    }, [searchTerm, projects]);

    const renderContent = () => {
        if (authLoading) {
            return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
        }
        
        if (!user) {
            return (
                <Card className="max-w-md mx-auto text-center">
                    <CardHeader>
                        <CardTitle>Access Denied</CardTitle>
                        <CardDescription>You must be logged in to view PDD projects.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild><Link href="/login"><LogIn className="mr-2 h-4 w-4" /> Log In to Continue</Link></Button>
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
                        placeholder="Search by project title or student name..."
                        className="pl-10 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({length: 6}).map((_, i) => <Card key={i} className="h-56"><CardContent className="p-6 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></CardContent></Card>)}
                    </div>
                ) : filteredProjects.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProjects.map(project => (
                            <Card key={project.id} className="flex flex-col">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={project.userPhotoURL} alt={project.userName} />
                                            <AvatarFallback>{project.userName.slice(0, 2)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <CardTitle className="text-lg leading-tight">{project.title}</CardTitle>
                                            <CardDescription>by {project.userName}</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <PddProjectLinks project={project} />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-16">
                        <FolderKanban className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <p className="mt-4">No projects found. Be the first to add one!</p>
                    </div>
                )}
            </>
        )
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 pt-20 pb-12 md:py-16">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
                        <div className="text-center sm:text-left">
                            <h2 className="text-3xl font-bold tracking-tight">PDD Projects Showcase</h2>
                            <p className="text-muted-foreground mt-2">
                                Explore a collection of projects and resources from your peers.
                            </p>
                        </div>
                        <AddPddProjectDialog onProjectAdded={() => {}} />
                    </div>
                    {renderContent()}
                </div>
            </main>
            <Footer />
        </div>
    );
}
