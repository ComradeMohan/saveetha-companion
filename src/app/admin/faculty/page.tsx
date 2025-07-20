
'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Faculty } from "@/lib/faculty-data";
import { MoreHorizontal, Loader2, Trash2, Pencil, UploadCloud } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AddFacultyDialog } from "@/components/admin/add-faculty-dialog";
import { collection, onSnapshot, orderBy, query, doc, deleteDoc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { EditFacultyDialog } from "@/components/admin/edit-faculty-dialog";
import { facultyData as localFacultyData } from "@/lib/faculty-data";

export default function AdminFacultyPage() {
    const [facultyData, setFacultyData] = useState<Faculty[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSeeding, setIsSeeding] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const q = query(collection(db, 'faculty'), orderBy('name'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const data: Faculty[] = [];
            querySnapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() } as Faculty);
            });
            setFacultyData(data);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching faculty data:", error);
            toast({
                title: "Error",
                description: "Could not fetch faculty data.",
                variant: "destructive"
            });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [toast]);

    const handleSeedDatabase = async () => {
        setIsSeeding(true);
        toast({
            title: "Seeding Database...",
            description: `Adding ${localFacultyData.length} faculty members. This may take a moment.`
        });
        try {
            const batch = writeBatch(db);
            const facultyCollection = collection(db, 'faculty');

            localFacultyData.forEach((facultyMember) => {
                const docRef = doc(facultyCollection); // Create a new doc with a random ID
                batch.set(docRef, {
                    name: facultyMember.name,
                    phone: facultyMember.phone,
                    department: facultyMember.department,
                    subjects: facultyMember.subjects || [],
                    roomNo: facultyMember.roomNo || '',
                    createdAt: new Date().toISOString()
                });
            });

            await batch.commit();

            toast({
                title: "Success!",
                description: "Firestore has been populated with local faculty data.",
            });
        } catch (error) {
            console.error("Error seeding database:", error);
            toast({
                title: "Error",
                description: "Could not seed the database. Check the console for details.",
                variant: "destructive"
            });
        } finally {
            setIsSeeding(false);
        }
    };


    const handleDeleteClick = (faculty: Faculty) => {
        setSelectedFaculty(faculty);
        setIsAlertOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedFaculty || !selectedFaculty.id) return;
        setIsDeleting(true);
        try {
            await deleteDoc(doc(db, 'faculty', selectedFaculty.id));
            toast({
                title: "Success",
                description: "Faculty member deleted successfully."
            });
        } catch (error) {
            console.error("Error deleting faculty:", error);
            toast({
                title: "Error",
                description: "Could not delete faculty member.",
                variant: "destructive"
            });
        } finally {
            setIsDeleting(false);
            setIsAlertOpen(false);
            setSelectedFaculty(null);
        }
    };

    return (
        <>
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Faculty Management</h2>
                        <p className="text-muted-foreground">
                            Here you can add, edit, or remove faculty members from the directory.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                         <Button
                            variant="outline"
                            onClick={handleSeedDatabase}
                            disabled={isSeeding || facultyData.length > 0}
                        >
                            {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                            Seed Database
                        </Button>
                        <AddFacultyDialog />
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Faculty Members</CardTitle>
                        <CardDescription>
                            A list of all faculty members in the system.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Phone Number</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                        </TableCell>
                                    </TableRow>
                                ) : facultyData.length > 0 ? (
                                    facultyData.map((faculty) => (
                                        <TableRow key={faculty.id}>
                                            <TableCell className="font-medium">
                                                {faculty.name}
                                            </TableCell>
                                            <TableCell>{faculty.department}</TableCell>
                                            <TableCell>{faculty.phone}</TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Toggle menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <EditFacultyDialog faculty={faculty}>
                                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                        </EditFacultyDialog>
                                                        <DropdownMenuItem onClick={() => handleDeleteClick(faculty)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
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
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            No faculty found. Click "Seed Database" to populate from local data.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the faculty member
                             <span className="font-semibold"> {selectedFaculty?.name}</span> and remove their data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
