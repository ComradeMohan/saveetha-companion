
'use client';

import { useEffect, useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, ExternalLink, MoreHorizontal, Pencil, Trash2, Search, BrainCircuit } from "lucide-react";
import { collection, orderBy, query, doc, deleteDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import type { ConceptMap } from "@/lib/concept-map-data";
import { AddConceptMapDialog } from "@/components/admin/add-concept-map-dialog";
import { EditConceptMapDialog } from "@/components/admin/edit-concept-map-dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { feedKnowledge } from "@/ai/flows/knowledge-feeder";

export default function AdminConceptMapsPage() {
    const [conceptMaps, setConceptMaps] = useState<ConceptMap[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [mapToDelete, setMapToDelete] = useState<ConceptMap | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isFeeding, setIsFeeding] = useState(false);
    const { toast } = useToast();

    const fetchConceptMaps = useCallback(async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'concept-maps'), orderBy('title'));
            const querySnapshot = await getDocs(q);
            const data: ConceptMap[] = [];
            querySnapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() } as ConceptMap);
            });
            setConceptMaps(data);
        } catch (error) {
            console.error("Error fetching concept maps:", error);
            toast({
                title: "Error",
                description: "Could not fetch concept maps.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchConceptMaps();
    }, [fetchConceptMaps]);
    
    const filteredConceptMaps = useMemo(() => {
        if (!searchTerm) {
            return conceptMaps;
        }
        const lowercasedFilter = searchTerm.toLowerCase();
        return conceptMaps.filter(
            map => map.title.toLowerCase().includes(lowercasedFilter)
        );
    }, [searchTerm, conceptMaps]);


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
            fetchConceptMaps(); // Refetch data
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
    
    const handleFeedKnowledge = async () => {
        setIsFeeding(true);
        toast({
            title: "Starting AI Knowledge Feed",
            description: `Processing ${conceptMaps.length} documents. This may take a moment.`
        });

        for (const map of conceptMaps) {
            try {
                await feedKnowledge({ url: map.url });
            } catch(e) {
                console.error(`Failed to feed ${map.title}`, e);
                 toast({
                    title: "Feed Error",
                    description: `Failed to process: ${map.title}`,
                    variant: "destructive"
                });
            }
        }
        
        toast({
            title: "Knowledge Feed Complete",
            description: "The AI has processed all available concept maps for this session."
        });
        setIsFeeding(false);
    };


    return (
        <>
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Concept Map Management</h2>
                        <p className="text-muted-foreground">
                            Add, edit, or remove concept maps available to users.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                         <Button onClick={handleFeedKnowledge} disabled={isFeeding || loading}>
                            {isFeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
                            {isFeeding ? 'Feeding...' : 'Feed Knowledge to AI'}
                        </Button>
                        <AddConceptMapDialog onMapAdded={fetchConceptMaps} />
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Available Concept Maps</CardTitle>
                        <CardDescription>
                            A list of all concept maps in the system. Use the "Feed Knowledge" button to update the AI's knowledge for this session.
                        </CardDescription>
                         <div className="relative pt-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                            placeholder="Search by name..."
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
                                ) : filteredConceptMaps.length > 0 ? (
                                    filteredConceptMaps.map((map) => (
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
                                                         <EditConceptMapDialog conceptMap={map} onMapUpdated={fetchConceptMaps}>
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
                                            {searchTerm ? "No concept maps match your search." : "No concept maps found."}
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
