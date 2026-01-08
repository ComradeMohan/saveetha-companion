
'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, LogIn, PlusCircle, FolderKanban, Link as LinkIcon, Instagram, Github, Linkedin, Globe, FileText, Presentation, X } from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { PDDProject } from '@/types/pdd-project';
import { PddProjectLinks } from '@/components/pdd/pdd-project-links';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';

const urlSchema = z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal(''));

const projectSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }),
  instagramUrl: urlSchema,
  linkedinUrl: urlSchema,
  githubUrl: urlSchema,
  websiteUrl: urlSchema,
  gpcuDocUrl: urlSchema,
  patentDocUrl: urlSchema,
  canvaUrl: urlSchema,
  figmaUrl: urlSchema,
  gslidesUrl: urlSchema,
});

type ProjectFormValues = z.infer<typeof projectSchema>;

const formFields = [
    { name: 'instagramUrl', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/...' },
    { name: 'linkedinUrl', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/...' },
    { name: 'githubUrl', label: 'GitHub', icon: Github, placeholder: 'https://github.com/...' },
    { name: 'websiteUrl', label: 'Website/App', icon: Globe, placeholder: 'https://...' },
    { name: 'gpcuDocUrl', label: 'GPCU Doc', icon: FileText, placeholder: 'https://docs.google.com/...' },
    { name: 'patentDocUrl', label: 'Patent Doc', icon: FileText, placeholder: 'https://patents.google.com/...' },
    { name: 'canvaUrl', label: 'Canva', icon: Presentation, placeholder: 'https://canva.com/design/...' },
    { name: 'figmaUrl', label: 'Figma', icon: LinkIcon, placeholder: 'https://figma.com/...' },
    { name: 'gslidesUrl', label: 'Google Slides', icon: Presentation, placeholder: 'https://docs.google.com/presentation/...' },
] as const;


function AddProjectForm({ onProjectAdded, onCancel }: { onProjectAdded: () => void, onCancel: () => void }) {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const { user, profile } = useAuth();
  
    const form = useForm<ProjectFormValues>({
      resolver: zodResolver(projectSchema),
      defaultValues: {
        title: '',
        instagramUrl: '',
        linkedinUrl: '',
        githubUrl: '',
        websiteUrl: '',
        gpcuDocUrl: '',
        patentDocUrl: '',
        canvaUrl: '',
        figmaUrl: '',
        gslidesUrl: '',
      },
    });
  
    const onSubmit = async (values: ProjectFormValues) => {
      if (!user) {
          toast({ title: 'Authentication Error', description: 'You must be logged in to add a project.', variant: 'destructive' });
          return;
      }
      setLoading(true);
      try {
        await addDoc(collection(db, 'pdd-projects'), {
          ...values,
          userId: user.uid,
          userName: profile?.name || user.displayName,
          userEmail: user.email,
          userPhotoURL: profile?.photoURL || user.photoURL,
          createdAt: serverTimestamp(),
        });
        toast({ title: 'Success', description: 'Your project has been added!' });
        onProjectAdded();
        form.reset();
        onCancel();
      } catch (error) {
        console.error('Error adding project:', error);
        toast({ title: 'Error', description: 'Failed to add your project.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <Card className="mb-8 animate-in fade-in-50 duration-300">
        <CardHeader>
            <CardTitle>Add Your PDD Project</CardTitle>
            <CardDescription>Showcase your work by providing a title and any relevant links.</CardDescription>
        </CardHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Project Title</FormLabel>
                            <FormControl><Input placeholder="My Awesome Project" {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {formFields.map(f => (
                            <FormField
                                key={f.name}
                                control={form.control}
                                name={f.name}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            {<f.icon className="h-4 w-4" />}
                                            {f.label}
                                        </FormLabel>
                                        <FormControl><Input placeholder={f.placeholder} {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ))}
                    </div>
                </CardContent>
                <CardFooter className="gap-2 justify-end">
                    <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Add Project'}
                    </Button>
                </CardFooter>
            </form>
        </Form>
      </Card>
    );
  }

export default function PddProjectsPage() {
    const { user, loading: authLoading } = useAuth();
    const [projects, setProjects] = useState<PDDProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormVisible, setIsFormVisible] = useState(false);
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
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                    <div className="relative flex-grow w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search by project title or student name..."
                            className="pl-10 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {!isFormVisible && (
                        <Button onClick={() => setIsFormVisible(true)} className="w-full sm:w-auto flex-shrink-0">
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Your Project
                        </Button>
                    )}
                </div>

                {isFormVisible && (
                    <AddProjectForm onProjectAdded={fetchProjects} onCancel={() => setIsFormVisible(false)} />
                )}

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
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold tracking-tight">PDD Projects Showcase</h2>
                        <p className="text-muted-foreground mt-2">
                            Explore a collection of projects and resources from your peers.
                        </p>
                    </div>
                    {renderContent()}
                </div>
            </main>
            <Footer />
        </div>
    );
}
