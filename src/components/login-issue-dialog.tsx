
'use client';

import { useState, useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
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
import { useToast } from '@/hooks/use-toast';
import { Loader2, LifeBuoy } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { cn } from '@/lib/utils';
import { submitIssue } from '@/app/actions/submit-issue';


const issueFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  regNo: z.string().optional(),
  message: z.string().min(10, { message: 'Please describe your issue in at least 10 characters.' }),
  _gotcha: z.string().optional(), // Honeypot field
});

type IssueFormValues = z.infer<typeof issueFormSchema>;

const initialState = {
  type: '',
  message: '',
  errors: null,
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? (
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
  const [showInitialPrompt, setShowInitialPrompt] = useState(true);
  const { toast } = useToast();
  const [state, formAction] = useActionState(submitIssue, initialState);
  
  useEffect(() => {
    const timer = setTimeout(() => {
        setShowInitialPrompt(false);
    }, 5000); // Hide the prompt after 5 seconds

    return () => clearTimeout(timer);
  }, []);

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
  
  useEffect(() => {
    if (state.type) {
        toast({
            title: state.type === 'success' ? 'Success!' : 'Error',
            description: state.message,
            variant: state.type === 'error' ? 'destructive' : 'default',
        });
        if (state.type === 'success') {
            form.reset();
            setOpen(false);
        }
    }
  }, [state, toast, form]);


  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <div 
            className="relative"
            onMouseEnter={() => setShowInitialPrompt(false)}
            onFocus={() => setShowInitialPrompt(false)}
        >
             <div className={cn(
                "absolute bottom-full right-0 mb-2 w-max rounded-md bg-foreground px-3 py-1.5 text-sm text-background opacity-0 transition-opacity duration-300",
                showInitialPrompt && "opacity-100"
            )}>
                Login/Signup Problems?
            </div>
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
                        <p>Login/Signup Problems?</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report an Issue</DialogTitle>
          <DialogDescription>
            Can't log in or sign up? Fill out this form and we'll help you out.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form action={formAction} className="space-y-4">
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
