'use client';

import { useState, useEffect, useActionState, useRef, useTransition } from 'react';
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
const FEEDBACK_STORAGE_KEY = 'feedbackFormLastSeen';
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
  const [showRecruitmentDialog, setShowRecruitmentDialog] = useState(false);
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const [state, formAction] = useActionState(submitRecruitmentInterest, initialState);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  
  const form = useForm<RecruitmentFormValues>({
    resolver: zodResolver(recruitmentSchema),
    defaultValues: { personalEmail: '' },
  });

  useEffect(() => {
    // 1. Wait until authentication and profile loading is complete.
    if (loading) {
      return;
    }

    // 2. Decide which dialog to potentially show.
    if (user && profile) {
      const now = Date.now();

      // Condition to show RECRUITMENT dialog
      if (profile.recruitmentInterestSubmitted !== true) {
        const recruitmentLastSeen = localStorage.getItem(RECRUITMENT_STORAGE_KEY);
        if (!recruitmentLastSeen || now - parseInt(recruitmentLastSeen, 10) > ONE_HOUR) {
          const timer = setTimeout(() => {
            setShowRecruitmentDialog(true);
            localStorage.setItem(RECRUITMENT_STORAGE_KEY, now.toString());
          }, 5000);
          return () => clearTimeout(timer);
        }
      }
      // Condition to show FEEDBACK dialog
      else if (profile.recruitmentInterestSubmitted === true) {
        const feedbackLastSeen = localStorage.getItem(FEEDBACK_STORAGE_KEY);
        if (!feedbackLastSeen || now - parseInt(feedbackLastSeen, 10) > ONE_HOUR) {
          const timer = setTimeout(() => {
            window.dispatchEvent(new CustomEvent('showFeedbackDialog'));
            localStorage.setItem(FEEDBACK_STORAGE_KEY, now.toString());
          }, 8000);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [user, profile, loading]);

  useEffect(() => {
    if (state.type) {
      toast({
        title: state.type === 'success' ? 'Thank You!' : 'Error',
        description: state.message,
        variant: state.type === 'error' ? 'destructive' : 'default',
      });
      if (state.type === 'success') {
        formRef.current?.reset();
        setShowRecruitmentDialog(false);
      }
    }
  }, [state, toast]);
  
  const handleNotInterested = () => {
    const formData = new FormData();
    formData.append('name', user?.displayName || 'Anonymous');
    formData.append('userEmail', user?.email || '');
    formData.append('regNo', profile?.regNo || '');
    formData.append('batch', getBatchYear());
    formData.append('isInterested', 'false');
    formData.append('personalEmail', '');
    
    startTransition(() => {
        formAction(formData);
    });

    setShowRecruitmentDialog(false);
  }

  const getBatchYear = () => {
    if (!profile?.regNo || profile.regNo.length < 4) return 'N/A';
    // Correctly parse the year from the registration number (e.g., 2119XXXX -> 2019)
    const yearPrefix = profile.regNo.substring(2, 4);
    const year = parseInt(yearPrefix, 10);
    if (!isNaN(year)) {
        return `20${year}`;
    }
    return 'N/A';
  }

  // If recruitment has been submitted, this component's only job is to render the FeedbackDialog.
  if (profile?.recruitmentInterestSubmitted) {
      return <FeedbackDialog />;
  }
  
  if (!user || !profile?.regNo) return null;

  return (
    <Dialog open={showRecruitmentDialog} onOpenChange={setShowRecruitmentDialog}>
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
            <input type="hidden" name="isInterested" value="true" />

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
