
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
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { addTopic } from '@/app/actions/manage-course-content';

const topicSchema = z.object({
    title: z.string().min(3, 'Title is required.'),
    notes: z.string().optional(),
    videoUrl: z.string().url({ message: "Please enter a valid URL." }).or(z.literal('')).optional(),
    questions: z.string().optional(),
});

type TopicFormValues = z.infer<typeof topicSchema>;

interface AddTopicDialogProps {
  children: React.ReactNode;
  collegeId: string;
  departmentId: string;
  courseId: string;
  unitId: string;
  onTopicAdded: () => void;
}

export function AddTopicDialog({ children, collegeId, departmentId, courseId, unitId, onTopicAdded }: AddTopicDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<TopicFormValues>({
    resolver: zodResolver(topicSchema),
    defaultValues: { title: '', notes: '', videoUrl: '', questions: '' },
  });

  const onSubmit = async (values: TopicFormValues) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('notes', values.notes || '');
    formData.append('videoUrl', values.videoUrl || '');
    formData.append('questions', values.questions || '');
    
    try {
      const result = await addTopic(collegeId, departmentId, courseId, unitId, formData);
      if (result.type === 'success') {
          toast({ title: 'Success', description: 'Topic added successfully.' });
          onTopicAdded();
          form.reset();
          setOpen(false);
      } else {
          toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Topic</DialogTitle>
          <DialogDescription>
            Fill in the learning materials for this topic. Use Markdown for notes if needed.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <ScrollArea className="max-h-[60vh] -mr-4 pr-4">
                <div className="space-y-4 pr-2">
                    <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Topic Title</FormLabel>
                        <FormControl><Input placeholder="e.g., Introduction to Linked Lists" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Notes (Markdown supported)</FormLabel>
                        <FormControl><Textarea placeholder="* A linked list is a linear data structure..." {...field} className="min-h-32" /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="videoUrl"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>YouTube Video URL (Optional)</FormLabel>
                        <FormControl><Input placeholder="https://www.youtube.com/watch?v=..." {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="questions"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Practice Questions (Optional)</FormLabel>
                        <FormControl><Textarea placeholder="1. What is the time complexity of...?`" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
            </ScrollArea>
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Topic'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
