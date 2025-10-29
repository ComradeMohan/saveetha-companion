
'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, Eye, FileText, Certificate } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { collection, query, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatDistanceToNow } from 'date-fns';
import { Checkbox } from '../ui/checkbox';

interface BatchAdmin {
  id: string;
  email: string;
  batch: string;
}

interface Activity {
  id: string;
  action: string;
  contentType: 'certification' | 'concept-map';
  contentId: string;
  timestamp: any;
}

interface ViewActivityDialogProps {
  admin: BatchAdmin;
}

export function ViewActivityDialog({ admin }: ViewActivityDialogProps) {
  const [open, setOpen] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null);
  const [deleteAssociatedContent, setDeleteAssociatedContent] = useState(false);
  const { toast } = useToast();

  const fetchActivities = useCallback(async () => {
    if (!open) return;
    setLoading(true);
    try {
      const q = query(collection(db, 'batchAdmins', admin.id, 'activity'), orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);
      const data: Activity[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity));
      setActivities(data);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast({ title: 'Error', description: 'Could not fetch activities.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [admin.id, open, toast]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);
  
  const handleDelete = () => {
    if (!activityToDelete) return;

    startDeleteTransition(async () => {
        try {
            const activityRef = doc(db, 'batchAdmins', admin.id, 'activity', activityToDelete.id);
            await deleteDoc(activityRef);

            if (deleteAssociatedContent) {
                const collectionName = activityToDelete.contentType === 'certification' ? 'certifications' : 'concept-maps';
                const contentRef = doc(db, collectionName, activityToDelete.contentId);
                await deleteDoc(contentRef);
            }
            
            toast({ title: "Success", description: "Activity log removed." });
            fetchActivities(); // Refresh the list
        } catch (error) {
            console.error("Error deleting:", error);
            toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
        } finally {
            setActivityToDelete(null);
            setDeleteAssociatedContent(false);
        }
    });
  }

  return (
    <>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="mr-2 h-4 w-4" /> View Activity
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Activity Log: {admin.email}</DialogTitle>
          <DialogDescription>A log of all content added by this batch admin.</DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto pr-4">
          {loading ? (
            <div className="flex justify-center items-center h-24"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : activities.length > 0 ? (
            <div className="space-y-4">
                {activities.map(activity => (
                    <div key={activity.id} className="flex items-start justify-between gap-4 p-3 bg-secondary/50 rounded-lg">
                        <div className="flex items-start gap-3">
                             {activity.contentType === 'certification' ? <Certificate className="h-4 w-4 mt-1 text-primary" /> : <FileText className="h-4 w-4 mt-1 text-primary" />}
                             <div>
                                <p className="text-sm">{activity.action}</p>
                                <p className="text-xs text-muted-foreground">
                                    {activity.timestamp ? formatDistanceToNow(activity.timestamp.toDate(), { addSuffix: true }) : 'just now'}
                                </p>
                             </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setActivityToDelete(activity)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-10">No activity recorded for this user yet.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>

    <AlertDialog open={!!activityToDelete} onOpenChange={(isOpen) => !isOpen && setActivityToDelete(null)}>
        <AlertDialogContent>
             <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This will permanently delete the activity log: <span className="font-semibold">{activityToDelete?.action}</span>. This cannot be undone.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex items-center space-x-2 my-4">
                <Checkbox id="delete-content-checkbox" checked={deleteAssociatedContent} onCheckedChange={(checked) => setDeleteAssociatedContent(checked as boolean)} />
                <label
                    htmlFor="delete-content-checkbox"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-destructive"
                >
                    Also delete the associated content item.
                </label>
            </div>
             <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : 'Delete Activity'}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
