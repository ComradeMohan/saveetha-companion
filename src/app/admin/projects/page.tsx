
'use client';

import { useEffect, useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, ExternalLink, MoreHorizontal, Trash2, Search, Package, Image as ImageIcon } from "lucide-react";
import { collection, orderBy, query, doc, deleteDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import type { Project } from "@/lib/supabase";
import { AddProjectDialog } from "@/components/admin/add-project-dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

export default function AdminProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const { toast } = useToast();

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const data: Project[] = [];
            querySnapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() } as Project);
            });
            setProjects(data);
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


    const handleDeleteClick = (project: Project) => {
        setProjectToDelete(project);
    };

    const confirmDelete = async () => {
        if (!projectToDelete || !projectToDelete.id) return;
        setIsDeleting(true);
        try {
            await deleteDoc(doc(db, 'projects', projectToDelete.id));
            toast({
                title: "Success",
                description: "Project deleted successfully."
            });
            fetchProjects(); // Refetch data
        } catch (error) {
            console.error("Error deleting project:", error);
            toast({
                title: "Error",
                description: "Could not delete project.",
                variant: "destructive"
            });
        } finally {
            setIsDeleting(false);
            setProjectToDelete(null);
        }
    };

    return (
        <>
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Project Marketplace</h2>
                        <p className="text-muted-foreground">
                            Add, edit, or remove projects available to students.
                        </p>
                    </div>
                    <AddProjectDialog onProjectAdded={fetchProjects} />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Available Projects</CardTitle>
                        <CardDescription>
                            A list of all available projects in the marketplace.
                        </CardDescription>
                         <div className="relative pt-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                            placeholder="Search by title, category, description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-full md:w-1/2 lg:w-1/3"
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Project</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Files</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="w-[100px] text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                        </TableCell>
                                    </TableRow>
                                ) : filteredProjects.length > 0 ? (
                                    filteredProjects.map((project) => (
                                        <TableRow key={project.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 rounded-md">
                                                        <AvatarImage src={project.thumbnailUrl} alt={project.title} className="object-cover"/>
                                                        <AvatarFallback className="rounded-md"><ImageIcon /></AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-semibold">{project.title}</p>
                                                        <p className="text-sm text-muted-foreground truncate max-w-xs">{project.description}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{project.category}</TableCell>
                                            <TableCell>{project.files?.length || 0}</TableCell>
                                            <TableCell>
                                                {project.createdAt ? formatDistanceToNow(new Date(project.createdAt), { addSuffix: true }) : 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Toggle menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem 
                                                            onClick={() => handleDeleteClick(project)} 
                                                            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            {searchTerm ? "No projects match your search." : "No projects found."}
                                        </TableCell>
                                    </TableRow>
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
                            This will permanently delete the project: <span className="font-semibold">{projectToDelete?.title}</span> and all its associated files.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                           {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
