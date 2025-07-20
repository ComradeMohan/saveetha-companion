
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
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Textarea } from './ui/textarea';

const facultyRequestSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, { message: 'Please enter a valid phone number with country code.' }),
  department: z.string().min(3, { message: 'Please provide a department or subject.' }),
  roomNo: z.string().optional(),
});

type FacultyRequestFormValues = z.infer<typeof facultyRequestSchema>;

export function SuggestFacultyDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FacultyRequestFormValues>({
    resolver: zodResolver(facultyRequestSchema),
    defaultValues: {
      name: '',
      phone: '',
      department: '',
      roomNo: '',
    },
  });

  const onSubmit = async (values: FacultyRequestFormValues) => {
    setLoading(true);
    try {
      await addDoc(collection(db, 'faculty-requests'), {
        ...values,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      toast({
        title: 'Suggestion Submitted!',
        description: 'Thank you for your contribution. An admin will review it shortly.',
      });
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error('Error submitting faculty suggestion:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit your suggestion. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="link">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Missing Faculty
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Suggest a Faculty Member</DialogTitle>
          <DialogDescription>
            Help us keep the directory complete. Fill in the details for a missing faculty member.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Dr. Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 919876543210" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department / Subjects</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Computer Science or Artificial Intelligence" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="roomNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room No (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 404" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit for Review
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
