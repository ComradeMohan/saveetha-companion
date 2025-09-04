'use client';

import { useForm } from 'react-hook-form';
import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Send, ClipboardList, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { enrollInCourse } from '@/app/actions/enroll-in-course';
import Link from 'next/link';

const formSchema = z.object({
  name: z.string(), // Hidden field
  email: z.string().email(), // Hidden field
  slot: z.string().min(1, 'Please select a slot.'),
  courseCode: z.string().regex(/^[A-Z]{3}\d+$/, {
    message: 'Must be 3 uppercase letters and numbers (e.g., CSE101).',
  }),
});

type FormValues = z.infer<typeof formSchema>;

const initialState = {
  type: '',
  message: '',
  errors: {
    slot: [],
    courseCode: [],
  },
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Submitting...
        </>
      ) : (
        <>
          <Send className="mr-2 h-4 w-4" /> Submit Alert
        </>
      )}
    </Button>
  );
}

export default function EnrollmentForm() {
  const [state, formAction] = useActionState(enrollInCourse, initialState as any);
  const { toast } = useToast();
  const { user, loading } = useAuth();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      slot: '',
      courseCode: '',
    },
  });

  const slotValue = form.watch('slot');

  useEffect(() => {
    if (user) {
      form.setValue('name', user.displayName || '');
      form.setValue('email', user.email || '');
    }
  }, [user, form]);
  
  useEffect(() => {
    if (state.type) {
      toast({
        title: state.type === 'success' ? 'Success!' : 'Error',
        description: state.message,
        variant: state.type === 'error' ? 'destructive' : 'default',
      });
      if (state.type === 'success') {
        form.reset({
          name: user?.displayName || '',
          email: user?.email || '',
          slot: '',
          courseCode: '',
        });
      }
    }
  }, [state, toast, form, user]);

  const slots = Array.from({ length: 26 }, (_, i) => String.fromCharCode('A'.charCodeAt(0) + i));

  if (loading) {
      return (
          <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
          </div>
      )
  }

  if (!user) {
      return (
          <Card className="max-w-2xl mx-auto text-center">
              <CardHeader>
                  <CardTitle>Login Required</CardTitle>
                  <CardDescription>You must be logged in to use the alert system.</CardDescription>
              </CardHeader>
              <CardContent>
                  <Button asChild>
                      <Link href="/login"><LogIn className="mr-2 h-4 w-4" /> Log In to Continue</Link>
                  </Button>
              </CardContent>
          </Card>
      )
  }


  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold tracking-tight">Course Enrollment Alert System</h2>
        <p className="text-muted-foreground mt-2">
          Select your slot and enter the course code to set up an alert.
        </p>
      </div>
      <Card className="shadow-lg transition-all duration-300 hover:shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" /> Enrollment Alert Form
          </CardTitle>
          <CardDescription>Your name and email are pre-filled from your profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form action={formAction} className="space-y-6">
              <input type="hidden" {...form.register('name')} />
              <input type="hidden" {...form.register('email')} />
              <input type="hidden" name="slot" value={slotValue} />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="slot"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slot</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a slot" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {slots.map(slot => (
                            <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage>{state.errors?.slot?.[0]}</FormMessage>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="courseCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Code</FormLabel>
                      <FormControl>
                        <Input 
                            placeholder="e.g., CSE101" 
                            {...field} 
                            onChange={(e) => {
                                field.onChange(e.target.value.toUpperCase())
                            }}
                        />
                      </FormControl>
                      <FormMessage>{state.errors?.courseCode?.[0]}</FormMessage>
                    </FormItem>
                  )}
                />
              </div>
              <SubmitButton />
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
