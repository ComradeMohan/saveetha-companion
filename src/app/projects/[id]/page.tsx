
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Project } from '@/lib/supabase';
import Header from '@/components/header';
import Footer from '@/components/footer';
import LoadingAnimation from '@/components/loading-animation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Download, File as FileIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


export default function ProjectDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProject = async () => {
            if (typeof id !== 'string') return;
            setLoading(true);
            try {
                const docRef = doc(db, 'projects', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setProject({ id: docSnap.id, ...docSnap.data() } as Project);
                } else {
                    router.push('/404');
                }
            } catch (error) {
                console.error("Error fetching project:", error);
                // Optionally add toast notification for error
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [id, router]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <LoadingAnimation />
            </div>
        );
    }
    
    if (!project) {
        return null; // or a not found component
    }

    return (
         <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 py-12 md:py-16 mt-16">
                <div className="container mx-auto px-4">
                     <Button asChild variant="outline" className="mb-6">
                        <Link href="/projects">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to All Projects
                        </Link>
                    </Button>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                             <Card>
                                <CardHeader className="p-0">
                                    <div className="relative w-full h-96">
                                        <Image
                                            src={project.thumbnailUrl}
                                            alt={project.title}
                                            layout="fill"
                                            objectFit="cover"
                                            className="rounded-t-xl"
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <Badge variant="secondary" className="mb-2 self-start">{project.category}</Badge>
                                    <h1 className="text-3xl font-bold tracking-tight mb-2">{project.title}</h1>
                                     <p className="text-sm text-muted-foreground mb-4">
                                        Published on {format(new Date(project.createdAt), 'PPP')}
                                    </p>
                                    <div className="prose dark:prose-invert max-w-none">
                                        <p>{project.description}</p>
                                    </div>
                                </CardContent>
                             </Card>
                        </div>
                        <div className="lg:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Project Files</CardTitle>
                                    <CardDescription>Download the files associated with this project.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {project.files.map((file, index) => (
                                         <a 
                                            key={index}
                                            href={file.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="block"
                                        >
                                            <div className="flex items-center p-3 rounded-lg border bg-secondary/30 hover:bg-secondary/70 transition-colors">
                                                <FileIcon className="h-6 w-6 mr-3 text-primary" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">{file.name}</p>
                                                    <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                                                </div>
                                                <Download className="h-5 w-5 text-muted-foreground ml-2" />
                                            </div>
                                        </a>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
