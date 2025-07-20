
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
import { PlusCircle, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type Event = {
  id?: string;
  title: string;
  startDate: string; // ISO string
  endDate?: string; // ISO string, optional
  targetAudience: "All Years" | "1st Year" | "2nd Year" | "3rd Year" | "4th Year";
};

const audienceOptions = ["All Years", "1st Year", "2nd Year", "3rd Year", "4th Year"];

const eventSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }),
  startDate: z.date({ required_error: 'A start date is required.' }),
  endDate: z.date().optional(),
  targetAudience: z.enum(["All Years", "1st Year", "2nd Year", "3rd Year", "4th Year"], {
     required_error: "You need to select a target audience."
  }),
}).refine(data => {
    if (data.endDate && data.startDate > data.endDate) {
        return false;
    }
    return true;
}, {
    message: "End date cannot be before start date.",
    path: ["endDate"],
});


type EventFormValues = z.infer<typeof eventSchema>;

export function AddEventDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
    },
  });

  const onSubmit = async (values: EventFormValues) => {
    setLoading(true);
    try {
      await addDoc(collection(db, 'events'), {
        title: values.title,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate ? values.endDate.toISOString() : null,
        targetAudience: values.targetAudience,
        createdAt: new Date().toISOString(),
      });

      toast({
        title: 'Success',
        description: 'Event added successfully.',
      });
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error('Error adding event to Firestore:', error);
      toast({
        title: 'Error',
        description: 'Failed to save event. Please try again.',
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
          <PlusCircle className="mr-2 h-4 w-4" /> Add Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Event</DialogTitle>
          <DialogDescription>
            Fill in the details for the new event below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Mid-term Exams" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                    )}
                                    >
                                    {field.value ? (
                                        format(field.value, "PPP")
                                    ) : (
                                        <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) => date < new Date("1900-01-01")}
                                    initialFocus
                                />
                            </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>End Date (Optional)</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                    )}
                                    >
                                    {field.value ? (
                                        format(field.value, "PPP")
                                    ) : (
                                        <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) => date < new Date("1900-01-01")}
                                    initialFocus
                                />
                            </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            <FormField
                control={form.control}
                name="targetAudience"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Target Audience</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select who this event is for" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {audienceOptions.map(option => (
                                    <SelectItem key={option} value={option}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Event'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
