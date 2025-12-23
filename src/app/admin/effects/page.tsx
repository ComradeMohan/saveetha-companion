
'use client';

import { useState, useEffect, useActionState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Sparkles, Trash2, Wand2 } from 'lucide-react';
import { addSpecialEvent, getSpecialEvents, deleteSpecialEvent, effectTypes } from '@/app/actions/manage-effects';
import type { SpecialEvent } from '@/app/actions/manage-effects';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

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
          Adding...
        </>
      ) : (
        <>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Event
        </>
      )}
    </Button>
  );
}

export default function EffectsAdminPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(addSpecialEvent, initialState);
  const [events, setEvents] = useState<SpecialEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchEvents = async () => {
    setLoading(true);
    const fetchedEvents = await getSpecialEvents();
    setEvents(fetchedEvents);
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (state.type) {
      toast({
        title: state.type === 'success' ? 'Success!' : 'Error',
        description: state.message,
        variant: state.type === 'error' ? 'destructive' : 'default',
      });
      if (state.type === 'success') {
        formRef.current?.reset();
        fetchEvents();
      }
    }
  }, [state, toast]);
  
  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    const result = await deleteSpecialEvent(id);
    toast({
        title: result.type === 'success' ? 'Success' : 'Error',
        description: result.message,
        variant: result.type === 'error' ? 'destructive' : 'default',
    });
    if (result.type === 'success') {
        fetchEvents();
    }
    setIsDeleting(null);
  }

  const handleTestEffect = (effect: string) => {
    const url = `/?test_date=${effect}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Seasonal Effects</h2>
          <p className="text-muted-foreground">Manage custom date-based UI effects like snow, fireworks, and confetti.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleTestEffect('dec25')}>Test Christmas</Button>
            <Button variant="outline" onClick={() => handleTestEffect('jan1')}>Test New Year</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <Card className="lg:col-span-1">
          <form ref={formRef} action={formAction}>
            <CardHeader>
              <CardTitle>Add New Custom Event</CardTitle>
              <CardDescription>This will override any default effects on the selected date.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" />
                {state.errors?.date && <p className="text-sm font-medium text-destructive">{state.errors.date[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Display Message</Label>
                <Input id="message" name="message" placeholder="e.g., Happy Holidays!" />
                 {state.errors?.message && <p className="text-sm font-medium text-destructive">{state.errors.message[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="effect">Effect Type</Label>
                <Select name="effect">
                    <SelectTrigger id="effect">
                        <SelectValue placeholder="Select an effect" />
                    </SelectTrigger>
                    <SelectContent>
                        {effectTypes.map(eff => <SelectItem key={eff} value={eff} className="capitalize">{eff}</SelectItem>)}
                    </SelectContent>
                </Select>
                 {state.errors?.effect && <p className="text-sm font-medium text-destructive">{state.errors.effect[0]}</p>}
              </div>
            </CardContent>
            <CardFooter>
              <SubmitButton />
            </CardFooter>
          </form>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Scheduled Events</CardTitle>
            <CardDescription>A list of all default and custom seasonal events.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Effect</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                    <TableRow><TableCell colSpan={4} className="text-center h-24"><Loader2 className="h-6 w-6 animate-spin mx-auto"/></TableCell></TableRow>
                ) : (
                    <>
                        <TableRow className="bg-muted/30"><TableCell colSpan={4} className="py-1 px-2 text-xs font-semibold text-muted-foreground">Default Events</TableCell></TableRow>
                        <TableRow><TableCell>Dec 25</TableCell><TableCell>"Happy birthday To U my dear friend"</TableCell><TableCell>fireworks</TableCell><TableCell></TableCell></TableRow>
                        <TableRow><TableCell>Dec 31</TableCell><TableCell>Countdown</TableCell><TableCell>fireworks</TableCell><TableCell></TableCell></TableRow>
                        <TableRow><TableCell>Jan 1</TableCell><TableCell>"Happy New Year!"</TableCell><TableCell>confetti</TableCell><TableCell></TableCell></TableRow>
                        <TableRow><TableCell>Other</TableCell><TableCell>N/A</TableCell><TableCell>snow</TableCell><TableCell></TableCell></TableRow>
                        
                        <TableRow className="bg-muted/30"><TableCell colSpan={4} className="py-1 px-2 text-xs font-semibold text-muted-foreground">Custom Events</TableCell></TableRow>
                        {events.length > 0 ? events.map(event => (
                             <TableRow key={event.id}>
                                <TableCell>{format(new Date(event.date.replace(/-/g, '/')), 'MMM d, yyyy')}</TableCell>
                                <TableCell>{event.message}</TableCell>
                                <TableCell className="capitalize">{event.effect}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" disabled={isDeleting === event.id} onClick={() => handleDelete(event.id)}>
                                        {isDeleting === event.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4 text-destructive" />}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )) : <TableRow><TableCell colSpan={4} className="text-center h-24">No custom events scheduled.</TableCell></TableRow>}
                    </>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
