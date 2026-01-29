'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Gift, Loader2, PartyPopper } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { distributeInitialCredits } from '@/app/actions/manage-credits';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function CreditManagementPage() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDistribute = async () => {
    setLoading(true);
    try {
      const result = await distributeInitialCredits();
      toast({
        title: result.type === 'success' ? 'Process Complete' : 'Error',
        description: result.message,
        variant: result.type === 'error' ? 'destructive' : 'default',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div>
            <h2 className="text-3xl font-bold tracking-tight">Credit Management</h2>
            <p className="text-muted-foreground">Distribute credits and manage user balances.</p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Initial Credit Distribution</CardTitle>
                <CardDescription>
                    This tool will grant 50 credits to any user who does not currently have a credit balance.
                    It will also send them a notification.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <Alert>
                    <PartyPopper className="h-4 w-4" />
                    <AlertTitle>How it works</AlertTitle>
                    <AlertDescription>
                       Clicking the button will scan all users. If a user does not have a `credits` field in their profile, it will be set to 50. Users who already have credits will not be affected. This is safe to run multiple times.
                    </AlertDescription>
                </Alert>
            </CardContent>
            <CardFooter>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Gift className="mr-2 h-4 w-4" />}
                            Distribute 50 Credits
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will start a process to check all users and distribute credits. This action cannot be undone. Are you ready to proceed?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDistribute}>
                                Yes, Distribute Credits
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardFooter>
        </Card>
    </div>
  );
}
