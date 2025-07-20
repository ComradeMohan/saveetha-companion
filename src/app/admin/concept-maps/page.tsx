
'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, ExternalLink } from "lucide-react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import type { ConceptMap } from "@/lib/concept-map-data";
import { AddConceptMapDialog } from "@/components/admin/add-concept-map-dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
                                <TableHead>Title</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="w-[100px] text-center">Link</TableHead>
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
                                        <TableCell>
                                           {map.description}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Button asChild variant="outline" size="icon">
                                                <Link href={map.url} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="h-4 w-4" />
                                                    <span className="sr-only">Open Link</span>
                                                </Link>
                                            </Button>
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
