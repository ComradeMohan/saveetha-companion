
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
import { Loader2, LifeBuoy } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';


const issueFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  regNo: z.string().optional(),
  message: z.string().min(10, { message: 'Please describe your issue in at least 10 characters.' }),
  _gotcha: z.string().optional(), // Honeypot field
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
      _gotcha: '',
    },
  });

  async function onSubmit(values: IssueFormValues) {
    if (values._gotcha) {
        // Bot submission, do nothing.
        return;
    }

    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('email', values.email);
    formData.append('regNo', values.regNo || 'Not provided');
    formData.append('message', values.message);
    formData.append('subject', 'Login/Registration Issue');
    if (values._gotcha) {
      formData.append('_gotcha', values._gotcha);
    }

    try {
        const response = await fetch("https://getform.io/f/bdrgjxeb", {
            method: "POST",
            body: formData,
            headers: {
                "Accept": "application/json",
            },
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        toast({
            title: 'Report Sent!',
            description: "We've received your report and will get back to you as soon as possible.",
        });
        
        form.reset();
        setOpen(false);

    } catch (error) {
        console.error("Error submitting issue to getform.io:", error);
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
             <FormField
                control={form.control}
                name="_gotcha"
                render={({ field }) => (
                    <FormItem className="hidden">
                    <FormControl>
                        <Input type="text" {...field} autoComplete="off" tabIndex={-1} />
                    </FormControl>
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
