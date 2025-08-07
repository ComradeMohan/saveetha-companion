
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Package, Search } from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import type { Project } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            const projectsData: Project[] = [];
            snapshot.forEach((doc) => {
                projectsData.push({ id: doc.id, ...doc.data() } as Project);
            });
            setProjects(projectsData);
        } catch (error) {
            console.error("Error fetching projects:", error);
            toast({
                title: "Error",
                description: "Could not fetch projects.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const filteredProjects = useMemo(() => {
        if (!searchTerm) {
            return projects;
        }
        const lowercasedFilter = searchTerm.toLowerCase();
        return projects.filter(
            project => project.title.toLowerCase().includes(lowercasedFilter) ||
                     project.category.toLowerCase().includes(lowercasedFilter) ||
                     project.description.toLowerCase().includes(lowercasedFilter)
        );
    }, [searchTerm, projects]);

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 py-12 md:py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold tracking-tight">Projects Marketplace</h2>
                        <p className="text-muted-foreground mt-2">
                            Explore projects, reports, and digital assets from students.
                        </p>
                    </div>

                    <div className="relative mb-8 max-w-lg mx-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search by title, category, etc..."
                            className="pl-10 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : filteredProjects.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredProjects.map(project => (
                                <Link key={project.id} href={`/projects/${project.id}`} className="group">
                                    <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-primary/20 hover:-translate-y-1">
                                        <CardHeader className="p-0">
                                            <div className="relative w-full h-48">
                                                <Image
                                                    src={project.thumbnailUrl}
                                                    alt={project.title}
                                                    layout="fill"
                                                    objectFit="cover"
                                                    className="transition-transform duration-300 group-hover:scale-105"
                                                />
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-4 flex-grow flex flex-col">
                                            <Badge variant="secondary" className="mb-2 self-start">{project.category}</Badge>
                                            <CardTitle className="text-lg leading-tight mb-1 flex-grow">{project.title}</CardTitle>
                                            <CardDescription className="text-sm line-clamp-2">{project.description}</CardDescription>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground py-16">
                            <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
                            <p className="mt-4">No projects found. Check back later!</p>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
