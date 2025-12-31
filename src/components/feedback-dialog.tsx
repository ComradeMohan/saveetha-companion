
'use client';

import { useState, useEffect, useActionState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { sendFeedback } from '@/app/actions/send-feedback';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MessageSquare, Send } from 'lucide-react';
import { Input } from './ui/input';
import { differenceInHours } from 'date-fns';

const feedbackSchema = z.object({
  feedback: z.string().min(10, { message: 'Feedback must be at least 10 characters.' }),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

const initialState = {
  type: '',
  message: '',
  errors: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Sending...
        </>
      ) : (
        <>
          <Send className="mr-2 h-4 w-4" /> Send Feedback
        </>
      )}
    </Button>
  );
}

export default function FeedbackDialog() {
  const [showDialog, setShowDialog] = useState(false);
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const [state, formAction] = useActionState(sendFeedback, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      feedback: '',
    },
  });
  
  useEffect(() => {
    // This effect is now just for handling the form submission result
    if (state.type) {
      toast({
        title: state.type === 'success' ? 'Success!' : 'Error',
        description: state.message,
        variant: state.type === 'error' ? 'destructive' : 'default',
      });
      if (state.type === 'success') {
        formRef.current?.reset();
        setShowDialog(false);
      }
    }
  }, [state, toast]);

  useEffect(() => {
    if (!loading && user && profile && profile.feedbackSubmitted !== true) {
      const accountCreationTime = user.metadata.creationTime ? new Date(user.metadata.creationTime) : new Date();
      const hoursSinceCreation = differenceInHours(new Date(), accountCreationTime);
      
      // Only show the dialog if the user account is older than 24 hours
      if (hoursSinceCreation > 24) {
        const timer = setTimeout(() => {
          setShowDialog(true);
        }, 8000);
        return () => clearTimeout(timer);
      }
    }
  }, [loading, user, profile]);


  if (!user || !profile || profile.feedbackSubmitted === true) {
    return null;
  }
  
  const handleClose = (open: boolean) => {
      // Don't close the dialog if the user is clicking outside
      if (!open && formRef.current) return;
      setShowDialog(open);
  }

  return (
    <Dialog open={showDialog} onOpenChange={handleClose}>
      <DialogContent 
        className="sm:max-w-md rounded-3xl"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare /> Got a Minute?
          </DialogTitle>
          <DialogDescription>
            We'd love to hear your thoughts! What can we improve? Any features you're missing?
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            ref={formRef}
            action={formAction}
            className="space-y-4"
          >
            {/* Hidden fields to pass user data */}
            <input type="hidden" name="name" value={user.displayName || 'Anonymous'} />
            <input type="hidden" name="email" value={user.email || ''} />
            <input type="hidden" name="uid" value={user.uid} />

            <FormField
              control={form.control}
              name="feedback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Feedback (Mandatory)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Request a feature..."
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             {state.errors?.feedback && <p className="text-sm font-medium text-destructive">{state.errors.feedback[0]}</p>}
            <DialogFooter>
              <SubmitButton />
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
