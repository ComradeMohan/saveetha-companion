
'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle } from 'lucide-react';
import { addCertification } from '@/app/actions/add-certification';
import { useAuth } from '@/hooks/use-auth';


const initialState = {
  type: '',
  message: '',
  errors: null,
};

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" disabled={pending} className="w-full">
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                </>
            ) : (
                <>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Certification
                </>
            )}
        </Button>
    );
}

export default function BatchAdminCertificationsPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(addCertification, initialState);
  const { toast } = useToast();
  const { user } = useAuth();

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
    <div className="space-y-6">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Add Certifications</h2>
            <p className="text-muted-foreground">Contribute to the student resource pool by adding new certification links.</p>
        </div>
        <Card className="max-w-2xl">
          <form ref={formRef} action={formAction}>
            <input type="hidden" name="userId" value={user?.uid || ''} />
            <CardHeader>
              <CardTitle>Add a New Certification</CardTitle>
              <CardDescription>
                Fill in the details below. The certification will be available to all students.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" placeholder="e.g., Google IT Support" required />
                {state.errors?.title && <p className="text-sm font-medium text-destructive">{state.errors.title[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <Input id="provider" name="provider" placeholder="e.g., Google, Microsoft" required />
                 {state.errors?.provider && <p className="text-sm font-medium text-destructive">{state.errors.provider[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" placeholder="A brief summary of the certification." required />
                 {state.errors?.description && <p className="text-sm font-medium text-destructive">{state.errors.description[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input id="url" name="url" placeholder="https://..." type="url" required />
                 {state.errors?.url && <p className="text-sm font-medium text-destructive">{state.errors.url[0]}</p>}
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
