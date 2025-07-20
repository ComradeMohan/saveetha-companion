
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { sendNotification } from '@/app/actions/send-notification';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send } from 'lucide-react';

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

export default function AdminNotificationsPage() {
    const [state, formAction] = useActionState(sendNotification, initialState);
    const { toast } = useToast();

    useEffect(() => {
        if (state.type) {
            toast({
                title: state.type === 'success' ? 'Success!' : 'Error',
                description: state.message,
                variant: state.type === 'error' ? 'destructive' : 'default',
            });
        }
    }, [state, toast]);

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Send Notifications</h2>
                    <p className="text-muted-foreground">
                        Broadcast messages to all users who have enabled notifications.
                    </p>
                </div>
            </div>

            <Card>
                <form action={formAction}>
                    <CardHeader>
                        <CardTitle>Compose Notification</CardTitle>
                        <CardDescription>
                            The message will be sent as a push notification to all opted-in users.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" name="title" placeholder="e.g., Important Announcement" />
                            {state.errors?.title && <p className="text-sm font-medium text-destructive">{state.errors.title[0]}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description / Message Body</Label>
                            <Textarea id="description" name="description" placeholder="Enter the main content of your notification here." />
                            {state.errors?.description && <p className="text-sm font-medium text-destructive">{state.errors.description[0]}</p>}
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
