
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
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const conceptMapSchema = z.object({
  title: z.string().min(3, { message: 'Name must be at least 3 characters.' }),
  url: z.string().url({ message: 'Please enter a valid URL.' }),
});

type ConceptMapFormValues = z.infer<typeof conceptMapSchema>;

export function AddConceptMapDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ConceptMapFormValues>({
    resolver: zodResolver(conceptMapSchema),
  });

  const onSubmit = async (values: ConceptMapFormValues) => {
    setLoading(true);
    try {
      await addDoc(collection(db, 'concept-maps'), {
        title: values.title,
        url: values.url,
        description: '', // Description is optional
        createdAt: new Date().toISOString(),
      });

      toast({
        title: 'Success',
        description: 'Concept map added successfully.',
      });
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
            Provide a name and a public URL for the new concept map file (image or PDF).
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
