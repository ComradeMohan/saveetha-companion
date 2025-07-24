
'use client';

import { useForm } from 'react-hook-form';
import { useActionState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Loader2, Send } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { sendMessage } from '@/app/actions/send-message';
import { useFormStatus } from 'react-dom';


const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
});

type FormValues = z.infer<typeof formSchema>;

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
            ) : <><Send className="mr-2 h-4 w-4" /> Send Message</> }
        </Button>
    )
}

export default function ContactForm() {
  const [state, formAction] = useActionState(sendMessage, initialState);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  });

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
            form.reset({ name: user?.displayName || '', email: user?.email || '', message: '' });
        }
    }
  }, [state, toast, form, user]);

  return (
    <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight">Contact Us</h2>
            <p className="text-muted-foreground mt-2">
                Send us a message for any queries or customization requests.
            </p>
        </div>
        <Card className="shadow-lg transition-all duration-300 hover:shadow-xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Mail className="h-6 w-6 text-primary" /> Send Us a Message
                </CardTitle>
                <CardDescription>We'll get back to you as soon as we can.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form action={formAction} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Your Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} disabled={!!user?.displayName} />
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
                                        <Input placeholder="john.doe@example.com" {...field} disabled={!!user?.email} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Message</FormLabel>
                                <FormControl>
                                <Textarea
                                    placeholder="Tell us how we can help..."
                                    className="min-h-[120px]"
                                    {...field}
                                />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <SubmitButton />
                    </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  );
}
