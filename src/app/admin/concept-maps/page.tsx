
'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, ExternalLink, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { collection, onSnapshot, orderBy, query, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import type { ConceptMap } from "@/lib/concept-map-data";
import { AddConceptMapDialog } from "@/components/admin/add-concept-map-dialog";
import { EditConceptMapDialog } from "@/components/admin/edit-concept-map-dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";


export default function AdminConceptMapsPage() {
    const [conceptMaps, setConceptMaps] = useState<ConceptMap[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [mapToDelete, setMapToDelete] = useState<ConceptMap | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const q = query(collection(db, 'concept-maps'), orderBy('title'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const data: ConceptMap[] = [];
            querySnapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() } as ConceptMap);
            });
            setConceptMaps(data);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching concept maps:", error);
            toast({
                title: "Error",
                description: "Could not fetch concept maps.",
                variant: "destructive"
            });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [toast]);

    const handleDeleteClick = (map: ConceptMap) => {
        setMapToDelete(map);
    };

    const confirmDelete = async () => {
        if (!mapToDelete || !mapToDelete.id) return;
        setIsDeleting(true);
        try {
            await deleteDoc(doc(db, 'concept-maps', mapToDelete.id));
            toast({
                title: "Success",
                description: "Concept map deleted successfully."
            });
        } catch (error) {
            console.error("Error deleting concept map:", error);
            toast({
                title: "Error",
                description: "Could not delete concept map.",
                variant: "destructive"
            });
        } finally {
            setIsDeleting(false);
            setMapToDelete(null);
        }
    };


    return (
        <>
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Concept Map Management</h2>
                        <p className="text-muted-foreground">
                            Add, edit, or remove concept maps available to users.
                        </p>
                    </div>
                    <AddConceptMapDialog />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Available Concept Maps</CardTitle>
                        <CardDescription>
                            A list of all concept maps in the system.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="w-[100px] text-center">Link</TableHead>
                                    <TableHead className="w-[100px] text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                        </TableCell>
                                    </TableRow>
                                ) : conceptMaps.length > 0 ? (
                                    conceptMaps.map((map) => (
                                        <TableRow key={map.id}>
                                            <TableCell className="font-medium">
                                                {map.title}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button asChild variant="outline" size="icon">
                                                    <Link href={map.url} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink className="h-4 w-4" />
                                                        <span className="sr-only">Open Link</span>
                                                    </Link>
                                                </Button>
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
                                                         <EditConceptMapDialog conceptMap={map}>
                                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                        </EditConceptMapDialog>
                                                        <DropdownMenuItem 
                                                            onClick={() => handleDeleteClick(map)} 
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
                                        <TableCell colSpan={3} className="h-24 text-center">
                                            No concept maps found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            
            <AlertDialog open={!!mapToDelete} onOpenChange={(isOpen) => !isOpen && setMapToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the concept map: <span className="font-semibold">{mapToDelete?.title}</span>.
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
