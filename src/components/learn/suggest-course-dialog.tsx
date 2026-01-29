
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
import { suggestCourse } from '@/app/actions/suggest-course';

const courseSchema = z.object({
  code: z.string().min(2, { message: 'Course code must be at least 2 characters.' }).regex(/^[A-Z]{3}\d+$/, {
    message: 'Must be 3 uppercase letters and numbers (e.g., CSE101).',
  }),
  name: z.string().min(3, { message: 'Course name must be at least 3 characters.' }),
});

type CourseFormValues = z.infer<typeof courseSchema>;

export function SuggestCourseDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      code: '',
      name: '',
    },
  });

  const onSubmit = async (values: CourseFormValues) => {
    setLoading(true);
    try {
      const result = await suggestCourse(values);
      
      if (result.type === 'success') {
          toast({
            title: 'Suggestion Submitted!',
            description: 'Thank you for your contribution. An admin will review it shortly.',
          });
          form.reset();
          setOpen(false);
      } else {
          toast({
              title: 'Error',
              description: result.message,
              variant: 'destructive',
          });
      }
    } catch (error) {
      console.error('Error suggesting course:', error);
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
        <Button variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" /> Suggest a Course
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Suggest a Missing Course</DialogTitle>
          <DialogDescription>
            If a course from your curriculum is missing, please add its details here.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Code</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., CSA17" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Artificial Intelligence" {...field} />
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
