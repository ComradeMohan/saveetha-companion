
'use client';

import { useState } from 'react';
import { useForm, useFormState } from 'react-hook-form';
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
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2, LifeBuoy } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';


const issueFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  regNo: z.string().optional(),
  message: z.string().min(10, { message: 'Please describe your issue in at least 10 characters.' }),
});

type IssueFormValues = z.infer<typeof issueFormSchema>;

function SubmitButton() {
    const { isSubmitting } = useFormState();
    return (
        <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                </>
            ) : "Send Report"}
        </Button>
    )
}

export function LoginIssueDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<IssueFormValues>({
    resolver: zodResolver(issueFormSchema),
    defaultValues: {
      name: '',
      email: '',
      regNo: '',
      message: '',
    },
  });

  async function onSubmit(values: IssueFormValues) {
    try {
        await addDoc(collection(db, 'contact-messages'), {
            name: values.name,
            email: values.email,
            message: `Reg No: ${values.regNo || 'Not provided'}\n\nIssue: ${values.message}`,
            status: 'Unread',
            createdAt: new Date().toISOString(),
            subject: 'Login/Registration Issue'
        });
        
        toast({
            title: 'Report Sent!',
            description: "We've received your report and will get back to you as soon as possible.",
        });
        
        form.reset();
        setOpen(false);

    } catch (error) {
        console.error("Error saving issue report to Firestore:", error);
        toast({
            title: "Error",
            description: "Could not send your report. Please try again later.",
            variant: 'destructive',
        });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="icon" className="rounded-full h-12 w-12 shadow-lg">
                            <LifeBuoy className="h-6 w-6" />
                            <span className="sr-only">Report an issue</span>
                        </Button>
                    </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Login or Signup Problems?</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report an Issue</DialogTitle>
          <DialogDescription>
            Can't log in or sign up? Fill out this form and we'll help you out.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Your Name</FormLabel>
                    <FormControl>
                        <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Your Email</FormLabel>
                    <FormControl>
                        <Input placeholder="john.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="regNo"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Registration Number (if applicable)</FormLabel>
                    <FormControl>
                        <Input placeholder="19YYDDRRR" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Describe your issue</FormLabel>
                    <FormControl>
                    <Textarea
                        placeholder="e.g., I'm not receiving the verification email."
                        className="min-h-[100px]"
                        {...field}
                    />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <DialogFooter>
                <SubmitButton />
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
