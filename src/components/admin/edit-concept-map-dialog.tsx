
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
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ConceptMap } from '@/lib/concept-map-data';

const conceptMapSchema = z.object({
  title: z.string().min(3, { message: 'Name must be at least 3 characters.' }),
  url: z.string().url({ message: 'Please enter a valid URL.' }),
});

type ConceptMapFormValues = z.infer<typeof conceptMapSchema>;

interface EditConceptMapDialogProps {
  conceptMap: ConceptMap;
  children: React.ReactNode;
  onMapUpdated: () => void;
}

export function EditConceptMapDialog({ conceptMap, children, onMapUpdated }: EditConceptMapDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ConceptMapFormValues>({
    resolver: zodResolver(conceptMapSchema),
    defaultValues: {
      title: conceptMap.title,
      url: conceptMap.url,
    },
  });

  const onSubmit = async (values: ConceptMapFormValues) => {
    if (!conceptMap.id) return;
    setLoading(true);
    try {
      const docRef = doc(db, 'concept-maps', conceptMap.id);
      await updateDoc(docRef, values);

      toast({
        title: 'Success',
        description: 'Concept map updated successfully.',
      });
      onMapUpdated(); // Callback to refetch data
      form.reset(values);
      setOpen(false);
    } catch (error) {
      console.error('Error updating concept map:', error);
      toast({
        title: 'Error',
        description: 'Failed to update concept map. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Concept Map</DialogTitle>
          <DialogDescription>
            Update the details for "{conceptMap.title}". Click save when you're done.
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
