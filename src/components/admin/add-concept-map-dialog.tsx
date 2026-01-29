
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PlusCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';

const conceptMapSchema = z.object({
  title: z.string().min(3, { message: 'Name must be at least 3 characters.' }),
  url: z.string().url({ message: 'Please enter a valid URL.' }),
});

type ConceptMapFormValues = z.infer<typeof conceptMapSchema>;

interface AddConceptMapDialogProps {
    onMapAdded: () => void;
}

export function AddConceptMapDialog({ onMapAdded }: AddConceptMapDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<ConceptMapFormValues>({
    resolver: zodResolver(conceptMapSchema),
    defaultValues: {
      title: '',
      url: ''
    }
  });

  const onSubmit = async (values: ConceptMapFormValues) => {
    if (!user) {
        toast({ title: 'Error', description: 'You must be logged in.', variant: 'destructive'});
        return;
    }
    setLoading(true);
    try {
      const newMapData: any = {
        title: values.title,
        url: values.url,
        description: '', 
        createdAt: new Date().toISOString(),
        createdBy: user.uid, // Add createdBy field
      };

      const newMapRef = await addDoc(collection(db, 'concept-maps'), newMapData);

      // If user is a batch admin, log activity
      const batchAdminRef = doc(db, 'batchAdmins', user.uid);
      const batchAdminDoc = await getDoc(batchAdminRef);
      if (batchAdminDoc.exists()) {
            const activityCollection = collection(db, 'batchAdmins', user.uid, 'activity');
            await addDoc(activityCollection, {
                action: `Added concept map: "${values.title}"`,
                contentType: 'concept-map',
                contentId: newMapRef.id,
                timestamp: serverTimestamp(),
            });
      }

      toast({
        title: 'Success',
        description: 'Concept map added successfully.',
      });
      onMapAdded();
      form.reset({ title: '', url: '' });
      setOpen(false);
    } catch (error) {
      console.error('Error adding concept map to Firestore:', error);
      toast({
        title: 'Error',
        description: 'Failed to save concept map details. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        if (!loading) {
            setOpen(isOpen);
            if (!isOpen) {
                form.reset();
            }
        }
    }}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Concept Map
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Concept Map</DialogTitle>
          <DialogDescription>
            Upload your file (image or PDF) to a public hosting service, then paste the name and URL below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Concept Map Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Data Structures & Algorithms" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File URL (PDF or Image)</FormLabel>
                   <FormControl>
                    <Input placeholder="https://example.com/map.pdf" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
