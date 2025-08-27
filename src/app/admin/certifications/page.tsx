
'use client';

import { useActionState, useEffect, useState, useCallback, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { addCertification } from '@/app/actions/add-certification';
import { deleteCertification } from '@/app/actions/delete-certification';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, PlusCircle, ExternalLink, Search } from 'lucide-react';
import { collection, orderBy, query, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from 'next/link';

const initialState = {
  type: '',
  message: '',
  errors: null,
};

interface Certification {
    id: string;
    title: string;
    description: string;
    provider: string;
    url: string;
}

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" disabled={pending} className="w-full">
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                </>
            ) : (
                <>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Certification
                </>
            )}
        </Button>
    );
}

export default function AdminCertificationsPage() {
    const formRef = useRef<HTMLFormElement>(null);
    const [state, formAction] = useActionState(addCertification, initialState);
    const [certifications, setCertifications] = useState<Certification[]>([]);
    const [filteredCerts, setFilteredCerts] = useState<Certification[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [certToDelete, setCertToDelete] = useState<Certification | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const { toast } = useToast();

    const fetchCertifications = useCallback(async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'certifications'), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            const data: Certification[] = [];
            snapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() } as Certification);
            });
            setCertifications(data);
            setFilteredCerts(data);
        } catch (error) {
            console.error("Error fetching certifications:", error);
            toast({ title: "Error", description: "Could not fetch certifications.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [toast]);
    
    useEffect(() => {
        fetchCertifications();
    }, [fetchCertifications]);

    useEffect(() => {
        if (state.type) {
            toast({
                title: state.type === 'success' ? 'Success!' : 'Error',
                description: state.message,
                variant: state.type === 'error' ? 'destructive' : 'default',
            });
            if (state.type === 'success') {
                formRef.current?.reset();
                fetchCertifications();
            }
        }
    }, [state, toast, fetchCertifications]);
    
    useEffect(() => {
        const lowercasedFilter = searchTerm.toLowerCase();
        const filtered = certifications.filter(cert => 
            cert.title.toLowerCase().includes(lowercasedFilter) ||
            cert.provider.toLowerCase().includes(lowercasedFilter) ||
            cert.description.toLowerCase().includes(lowercasedFilter)
        );
        setFilteredCerts(filtered);
    }, [searchTerm, certifications]);


    const handleDeleteClick = (cert: Certification) => {
        setCertToDelete(cert);
        setIsAlertOpen(true);
    };

    const confirmDelete = async () => {
        if (!certToDelete || !certToDelete.id) return;
        setIsDeleting(true);

        const result = await deleteCertification(certToDelete.id);
        
        toast({
            title: result.type === 'success' ? 'Success!' : 'Error',
            description: result.message,
            variant: result.type === 'error' ? 'destructive' : 'default',
        });

        if(result.type === 'success') {
            fetchCertifications();
        }

        setIsDeleting(false);
        setIsAlertOpen(false);
        setCertToDelete(null);
    };
    
    return (
        <>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
             <h2 className="text-3xl font-bold tracking-tight">Free Certifications</h2>
             <p className="text-muted-foreground">Add, manage, and remove certification resources for students.</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <Card className="lg:col-span-1">
                    <form action={formAction} ref={formRef}>
                        <CardHeader>
                            <CardTitle>Add a Certification</CardTitle>
                            <CardDescription>
                                Fill in the details below to add a new certification.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" name="title" placeholder="e.g., Google IT Support" />
                                {state.errors?.title && <p className="text-sm font-medium text-destructive">{state.errors.title[0]}</p>}
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="provider">Provider</Label>
                                <Input id="provider" name="provider" placeholder="e.g., Google, Microsoft" />
                                {state.errors?.provider && <p className="text-sm font-medium text-destructive">{state.errors.provider[0]}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" name="description" placeholder="A brief summary of the certification." />
                                {state.errors?.description && <p className="text-sm font-medium text-destructive">{state.errors.description[0]}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="url">URL</Label>
                                <Input id="url" name="url" placeholder="https://..." />
                                {state.errors?.url && <p className="text-sm font-medium text-destructive">{state.errors.url[0]}</p>}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <SubmitButton />
                        </CardFooter>
                    </form>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Available Certifications</CardTitle>
                        <CardDescription>A list of all added certification resources.</CardDescription>
                         <div className="relative pt-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by title, provider..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 w-full md:w-1/2"
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Certification</TableHead>
                                    <TableHead>Provider</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                        </TableCell>
                                    </TableRow>
                                ) : filteredCerts.length > 0 ? (
                                    filteredCerts.map((cert) => (
                                        <TableRow key={cert.id}>
                                            <TableCell className="font-medium">
                                                {cert.title}
                                                <p className="text-xs text-muted-foreground max-w-sm truncate">{cert.description}</p>
                                            </TableCell>
                                            <TableCell>{cert.provider}</TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                     <Button asChild variant="outline" size="icon">
                                                        <Link href={cert.url} target="_blank" rel="noopener noreferrer">
                                                            <ExternalLink className="h-4 w-4" />
                                                            <span className="sr-only">Open Link</span>
                                                        </Link>
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(cert)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                        <span className="sr-only">Delete</span>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">
                                            No certifications found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete the certification: <span className="font-semibold">{certToDelete?.title}</span>.
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
