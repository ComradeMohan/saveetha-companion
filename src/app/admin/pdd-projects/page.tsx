
'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { PDDProject } from '@/types/pdd-project';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { EditPddProjectDialog } from '@/components/pdd/edit-pdd-project-dialog';

export default function AdminPddProjectsPage() {
    const [projects, setProjects] = useState<PDDProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [projectToDelete, setProjectToDelete] = useState<PDDProject | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
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
            toast({ title: "Error", description: "Could not fetch projects.", variant: "destructive" });
            setLoading(false);
        });
        return unsubscribe;
    }, [toast]);

    useEffect(() => {
        const unsubscribe = fetchProjects();
        return () => unsubscribe();
    }, [fetchProjects]);

    const handleDelete = async () => {
        if (!projectToDelete) return;
        setIsDeleting(true);
        try {
            await deleteDoc(doc(db, 'pdd-projects', projectToDelete.id));
            toast({ title: 'Success', description: 'Project deleted successfully.' });
            setProjectToDelete(null);
        } catch (error) {
            console.error("Error deleting project:", error);
            toast({ title: 'Error', description: 'Could not delete project.', variant: 'destructive' });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">PDD Projects</h2>
                    <p className="text-muted-foreground">View, edit, and manage all submitted PDD projects.</p>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>All Submissions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Project Title</TableHead>
                                    <TableHead>Submitted By</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={4} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
                                ) : projects.length > 0 ? (
                                    projects.map(project => (
                                        <TableRow key={project.id}>
                                            <TableCell className="font-medium">{project.title}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarImage src={project.userPhotoURL} alt={project.userName} />
                                                        <AvatarFallback>{project.userName.slice(0, 2)}</AvatarFallback>
                                                    </Avatar>
                                                    <span>{project.userName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{project.createdAt ? formatDistanceToNow(project.createdAt.toDate(), { addSuffix: true }) : 'N/A'}</TableCell>
                                            <TableCell className="text-right">
                                                <EditPddProjectDialog project={project} onProjectUpdated={fetchProjects} />
                                                <AlertDialogTrigger asChild>
                                                     <Button variant="ghost" size="icon" onClick={() => setProjectToDelete(project)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={4} className="h-24 text-center">No projects submitted yet.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            
             <AlertDialog open={!!projectToDelete} onOpenChange={(isOpen) => !isOpen && setProjectToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the project titled "<span className="font-semibold">{projectToDelete?.title}</span>".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
