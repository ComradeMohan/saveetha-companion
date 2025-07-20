
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
  url: z.string().url({ message: 'Please enter a valid public URL.' }),
});

type ConceptMapFormValues = z.infer<typeof conceptMapSchema>;

export function AddConceptMapDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ConceptMapFormValues>({
    resolver: zodResolver(conceptMapSchema),
    defaultValues: {
      title: '',
      url: '',
    },
  });

  const onSubmit = async (values: ConceptMapFormValues) => {
    setLoading(true);
    try {
      await addDoc(collection(db, 'concept-maps'), {
        title: values.title,
        url: values.url,
        description: '', // Keep description field for schema consistency, but empty
        createdAt: new Date().toISOString(),
      });

      toast({
        title: 'Success',
        description: 'Concept map added successfully.',
      });
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error('Error adding concept map:', error);
      toast({
        title: 'Error',
        description: 'Failed to add concept map. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Concept Map
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Concept Map</DialogTitle>
          <DialogDescription>
            Upload your file (image or PDF) to a public hosting service, then paste the URL below.
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
                  <FormLabel>Public PDF/Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/your-file.pdf" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
