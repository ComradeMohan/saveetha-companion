
'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, Users as UsersIcon } from 'lucide-react';
import { sendNotification } from '@/app/actions/send-notification';
import { useAuth } from '@/hooks/use-auth';

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
                    <Send className="mr-2 h-4 w-4" />
                    Send Notification
                </>
            )}
        </Button>
    );
}

export default function BatchAdminPage() {
    const formRef = useRef<HTMLFormElement>(null);
    const [state, formAction] = useActionState(sendNotification, initialState);
    const { toast } = useToast();
    const { profile } = useAuth();
    
    const getBatchYear = () => {
        if (!profile?.regNo || profile.regNo.length < 4) return '';
        const yearPrefix = profile.regNo.substring(2, 4);
        const year = parseInt(yearPrefix, 10);
        if (!isNaN(year)) {
            return `20${year}`;
        }
        return '';
    }

    const batchYear = getBatchYear();

    useEffect(() => {
        if (state.type) {
            toast({
                title: state.type === 'success' ? 'Success!' : 'Error',
                description: state.message,
                variant: state.type === 'error' ? 'destructive' : 'default',
            });
            if (state.type === 'success') {
                formRef.current?.reset();
            }
        }
    }, [state, toast]);
    
    return (
        <div className="flex-1 space-y-4 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Batch Notification</h2>
                    <p className="text-muted-foreground">
                        Send a notification to all students in your batch.
                    </p>
                </div>
            </div>
            <Card className="max-w-2xl">
                <form action={formAction} ref={formRef}>
                    <input type="hidden" name="batchYear" value={batchYear} />

                    <CardHeader>
                        <CardTitle>Compose Message</CardTitle>
                        <CardDescription>
                           This will be sent to the in-app notification bell and as a push notification for all students of the {batchYear} batch.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-3 rounded-lg border p-4 bg-secondary/50">
                            <UsersIcon className="h-6 w-6 text-primary" />
                            <div>
                                <Label className="font-semibold">Recipient</Label>
                                <p className="text-sm text-muted-foreground">All Students - {batchYear} Batch</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" name="title" placeholder="e.g., Important Update" />
                             {state.errors?.title && <p className="text-sm font-medium text-destructive">{state.errors.title[0]}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea id="message" name="message" placeholder="Your message here..." />
                             {state.errors?.message && <p className="text-sm font-medium text-destructive">{state.errors.message[0]}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="link">Link (Optional)</Label>
                            <Input id="link" name="link" placeholder="https://example.com/more-info" />
                             {state.errors?.link && <p className="text-sm font-medium text-destructive">{state.errors.link[0]}</p>}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <SubmitButton />
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
