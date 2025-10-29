
'use client';

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, BrainCircuit, ExternalLink, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AddConceptMapDialog } from "@/components/admin/add-concept-map-dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ConceptMap } from "@/lib/concept-map-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function BatchAdminConceptMapsPage() {
    const [isFeeding, setIsFeeding] = useState(false);
    const [loadingMaps, setLoadingMaps] = useState(false);
    const [myMaps, setMyMaps] = useState<ConceptMap[]>([]);
    const [mapToDelete, setMapToDelete] = useState<ConceptMap | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const { toast } = useToast();
    const { user } = useAuth();

    const fetchMyMaps = useCallback(async () => {
        if (!user) return;
        setLoadingMaps(true);
        try {
            const q = query(collection(db, 'concept-maps'), where('createdBy', '==', user.uid));
            const snapshot = await getDocs(q);
            const data: ConceptMap[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ConceptMap));
            setMyMaps(data);
        } catch (error) {
            console.error("Error fetching concept maps:", error);
            toast({ title: "Error", description: "Could not fetch your concept maps.", variant: "destructive" });
        } finally {
            setLoadingMaps(false);
        }
    }, [user, toast]);

    useEffect(() => {
        fetchMyMaps();
    }, [fetchMyMaps]);

    const handleFeedKnowledge = async () => {
        setIsFeeding(true);
        toast({
            title: "Action Not Available",
            description: "The 'Feed Knowledge' action is restricted to full administrators.",
            variant: "destructive"
        });
        setTimeout(() => setIsFeeding(false), 2000);
    };
    
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
            fetchMyMaps(); // Refetch data
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
            <div className="flex-1 space-y-4 pt-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Concept Map Management</h2>
                        <p className="text-muted-foreground">
                            Add new concept map documents for the AI Tutor.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                         <Button onClick={handleFeedKnowledge} disabled={isFeeding}>
                            {isFeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
                            Feed Knowledge to AI
                        </Button>
                        <AddConceptMapDialog onMapAdded={fetchMyMaps} />
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>My Added Concept Maps</CardTitle>
                        <CardDescription>
                            A list of all concept maps you have contributed.
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
                                {loadingMaps ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                        </TableCell>
                                    </TableRow>
                                ) : myMaps.length > 0 ? (
                                    myMaps.map((map) => (
                                        <TableRow key={map.id}>
                                            <TableCell className="font-medium">{map.title}</TableCell>
                                            <TableCell className="text-center">
                                                 <Button asChild variant="outline" size="icon">
                                                    <Link href={map.url} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink className="h-4 w-4" />
                                                        <span className="sr-only">Open Link</span>
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(map)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                    <span className="sr-only">Delete</span>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                     <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">
                                            You have not added any concept maps yet.
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
