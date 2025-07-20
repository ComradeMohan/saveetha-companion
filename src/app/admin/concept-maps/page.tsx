
'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import type { ConceptMap } from "@/lib/concept-map-data";
import { AddConceptMapDialog } from "@/components/admin/add-concept-map-dialog";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export default function AdminConceptMapsPage() {
    const [conceptMaps, setConceptMaps] = useState<ConceptMap[]>([]);
    const [loading, setLoading] = useState(true);
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


    return (
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
                                <TableHead className="hidden w-[100px] sm:table-cell">
                                    <span className="sr-only">Image</span>
                                </TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Description</TableHead>
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
                                         <TableCell className="hidden sm:table-cell">
                                            <Image
                                                alt={map.title}
                                                className="aspect-square rounded-md object-cover"
                                                height="64"
                                                src={map.url}
                                                width="64"
                                                data-ai-hint="concept map diagram"
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {map.title}
                                        </TableCell>
                                        <TableCell>
                                           {map.description}
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
    );
}
