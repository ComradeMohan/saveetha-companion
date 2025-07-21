
'use client';

import { useActionState, useEffect, useState, useCallback } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createUpdate } from '@/app/actions/create-update';
import { deleteUpdate } from '@/app/actions/delete-update';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, Link as LinkIcon, Trash2 } from 'lucide-react';
import { collection, orderBy, query, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatDistanceToNow } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";


const initialState = {
  type: '',
  message: '',
  errors: null,
};

interface Update {
    id: string;
    title: string;
    description: string;
    link?: string;
    createdAt: any;
}

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" disabled={pending}>
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                </>
            ) : (
                <>
                    <Send className="mr-2 h-4 w-4" />
                    Post Update & Notify
                </>
            )}
        </Button>
    );
}

export default function AdminUpdatesPage() {
    const [state, formAction, isPending] = useActionState(createUpdate, initialState);
    const [updates, setUpdates] = useState<Update[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [updateToDelete, setUpdateToDelete] = useState<Update | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const { toast } = useToast();

    const fetchUpdates = useCallback(async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'updates'), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            const updatesData: Update[] = [];
            snapshot.forEach((doc) => {
                updatesData.push({ id: doc.id, ...doc.data() } as Update);
            });
            setUpdates(updatesData);
        } catch (error) {
             console.error("Error fetching updates:", error);
            toast({ title: "Error", description: "Could not fetch past updates.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [toast]);
    
    useEffect(() => {
        fetchUpdates();
    }, [fetchUpdates]);

    useEffect(() => {
        if (state.type) {
            toast({
                title: state.type === 'success' ? 'Success!' : 'Error',
                description: state.message,
                variant: state.type === 'error' ? 'destructive' : 'default',
            });
            if (state.type === 'success') {
                const form = document.getElementById('update-form') as HTMLFormElement;
                if(form) form.reset();
                fetchUpdates(); // Refetch updates after a successful post
            }
        }
    }, [state, toast, fetchUpdates]);

    const handleDeleteClick = (update: Update) => {
        setUpdateToDelete(update);
        setIsAlertOpen(true);
    };

    const confirmDelete = async () => {
        if (!updateToDelete || !updateToDelete.id) return;
        setIsDeleting(true);

        const result = await deleteUpdate(updateToDelete.id);
        
        toast({
            title: result.type === 'success' ? 'Success!' : 'Error',
            description: result.message,
            variant: result.type === 'error' ? 'destructive' : 'default',
        });

        if(result.type === 'success') {
            fetchUpdates();
        }

        setIsDeleting(false);
        setIsAlertOpen(false);
        setUpdateToDelete(null);
    };
    
    return (
        <>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div>
                <Card>
                    <form action={formAction} id="update-form">
                        <CardHeader>
                            <CardTitle>Create an Update</CardTitle>
                            <CardDescription>
                                This will be saved and will also send a push notification to all users.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" name="title" placeholder="e.g., Exam Schedule Released" />
                                {state.errors?.title && <p className="text-sm font-medium text-destructive">{state.errors.title[0]}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" name="description" placeholder="Describe the update in detail." />
                                {state.errors?.description && <p className="text-sm font-medium text-destructive">{state.errors.description[0]}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="link">Link (Optional)</Label>
                                <Input id="link" name="link" placeholder="https://example.com/more-info" />
                                {state.errors?.link && <p className="text-sm font-medium text-destructive">{state.errors.link[0]}</p>}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <SubmitButton />
                        </CardFooter>
                    </form>
                </Card>
            </div>
             <div>
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Updates</CardTitle>
                        <CardDescription>A list of the most recent updates you have posted.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center items-center h-24">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        ) : updates.length > 0 ? (
                            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                                {updates.map(update => (
                                    <div key={update.id} className="p-4 bg-secondary/50 rounded-lg">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <h4 className="font-semibold">{update.title}</h4>
                                                <p className="text-xs text-muted-foreground">
                                                    {update.createdAt ? formatDistanceToNow(update.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                                                </p>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(update)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                <span className="sr-only">Delete update</span>
                                            </Button>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">{update.description}</p>
                                        {update.link && (
                                            <Button asChild variant="link" size="sm" className="p-0 h-auto mt-2">
                                                <a href={update.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                                                    <LinkIcon className="h-3 w-3" /> {update.link}
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-muted-foreground py-10">
                                <p>No updates posted yet.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
         <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete the update: <span className="font-semibold">{updateToDelete?.title}</span>. This action cannot be undone.
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

