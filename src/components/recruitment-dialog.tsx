
'use client';

import { useState, useEffect, useActionState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { submitRecruitmentInterest } from '@/app/actions/submit-recruitment-interest';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Hand, Send } from 'lucide-react';
import { Input } from './ui/input';
import FeedbackDialog from './feedback-dialog';

const RECRUITMENT_STORAGE_KEY = 'recruitmentFormLastSeen';
const ONE_HOUR = 60 * 60 * 1000;

const recruitmentSchema = z.object({
  personalEmail: z.string().email({ message: 'Please enter a valid personal email.' }),
});

type RecruitmentFormValues = z.infer<typeof recruitmentSchema>;

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
          Submitting...
        </>
      ) : (
        "I'm Interested"
      )}
    </Button>
  );
}

export function RecruitmentDialog() {
  const [showDialog, setShowDialog] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const [state, formAction] = useActionState(submitRecruitmentInterest, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  
  const form = useForm<RecruitmentFormValues>({
    resolver: zodResolver(recruitmentSchema),
    defaultValues: { personalEmail: '' },
  });

  useEffect(() => {
    if (loading || !user) return;

    const lastSeen = localStorage.getItem(RECRUITMENT_STORAGE_KEY);
    const now = Date.now();

    if (!lastSeen || now - parseInt(lastSeen) > ONE_HOUR) {
      const timer = setTimeout(() => {
        setShowDialog(true);
        localStorage.setItem(RECRUITMENT_STORAGE_KEY, now.toString());
      }, 5000); // Show after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [user, loading]);

  useEffect(() => {
    if (state.type) {
      toast({
        title: state.type === 'success' ? 'Thank You!' : 'Error',
        description: state.message,
        variant: state.type === 'error' ? 'destructive' : 'default',
      });
      if (state.type === 'success') {
        formRef.current?.reset();
        setShowDialog(false);
      }
    }
  }, [state, toast]);

  const handleNotInterested = () => {
    setShowDialog(false);
    // Show the regular feedback form after a short delay
    setTimeout(() => {
        setShowFeedback(true);
    }, 500); 
  };
  
  const getBatchYear = () => {
    if (!profile?.regNo) return 'N/A';
    const yearPrefix = profile.regNo.substring(0, 2);
    const year = parseInt(yearPrefix, 10);
    if (!isNaN(year)) {
        return `20${year}`;
    }
    return 'N/A';
  }

  if (!user || !profile?.regNo) return null;
  
  if (showFeedback) {
      return <FeedbackDialog />;
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hand className="text-primary" /> Join the Team!
          </DialogTitle>
          <DialogDescription>
            Are you interested in handling website updates for courses, events, and more for your batch ({getBatchYear()})? Help us keep the platform up-to-date!
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form ref={formRef} action={formAction} className="space-y-4">
            <input type="hidden" name="name" value={user.displayName || 'Anonymous'} />
            <input type="hidden" name="userEmail" value={user.email || ''} />
            <input type="hidden" name="regNo" value={profile.regNo || ''} />
            <input type="hidden" name="batch" value={getBatchYear()} />

            <FormField
              control={form.control}
              name="personalEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Personal Email</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., your-name@gmail.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {state.errors?.personalEmail && <p className="text-sm font-medium text-destructive">{state.errors.personalEmail[0]}</p>}
            <DialogFooter className="grid grid-cols-2 gap-2">
              <Button type="button" variant="ghost" onClick={handleNotInterested}>
                Not Interested
              </Button>
              <SubmitButton />
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
