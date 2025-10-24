
'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, X, Users as UsersIcon, User as UserIcon } from 'lucide-react';
import { sendNotification } from '@/app/actions/send-notification';
import { getAllUsers, type BasicUser } from '@/app/actions/get-users';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const initialState = {
  type: '',
  message: '',
  errors: null,
};

function SubmitButton({ sendToAll, recipientCount, batchYear }: { sendToAll: boolean, recipientCount: number, batchYear: string }) {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" disabled={pending || (!sendToAll && !batchYear && recipientCount === 0)}>
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
    const formRef = useRef<HTMLFormElement>(null);
    const [state, formAction] = useActionState(sendNotification, initialState);
    const { toast } = useToast();

    const [allUsers, setAllUsers] = useState<BasicUser[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<BasicUser[]>([]);
    const [open, setOpen] = useState(false);
    const [sendToAll, setSendToAll] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState('');

    const batchYears = ['2022', '2023', '2024', '2025'];

    useEffect(() => {
        const fetchUsers = async () => {
            const users = await getAllUsers();
            setAllUsers(users);
        };
        fetchUsers();
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
                setSelectedUsers([]);
                setSendToAll(false);
                setSelectedBatch('');
            }
        }
    }, [state, toast]);

    const handleSelectUser = (user: BasicUser) => {
        if (!selectedUsers.some(u => u.id === user.id)) {
            setSelectedUsers(prev => [...prev, user]);
        }
        setOpen(false);
    };

    const handleRemoveUser = (userId: string) => {
        setSelectedUsers(prev => prev.filter(u => u.id !== userId));
    };

    const handleSendToAllChange = (checked: boolean) => {
        setSendToAll(checked);
        if (checked) {
            setSelectedBatch('');
            setSelectedUsers([]);
        }
    }

    const handleBatchChange = (value: string) => {
        setSelectedBatch(value);
        if (value) {
            setSendToAll(false);
            setSelectedUsers([]);
        }
    }

    const filteredUsers = allUsers.filter(user => !selectedUsers.some(su => su.id === user.id));
    
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Send Notification</h2>
                    <p className="text-muted-foreground">
                        Send a targeted notification to users.
                    </p>
                </div>
            </div>
            <Card className="max-w-2xl">
                <form action={formAction} ref={formRef}>
                    <input type="hidden" name="userIds" value={selectedUsers.map(u => u.id).join(',')} />
                    <input type="hidden" name="sendToAll" value={sendToAll ? 'on' : 'off'} />
                    <input type="hidden" name="batchYear" value={selectedBatch} />

                    <CardHeader>
                        <CardTitle>Compose Message</CardTitle>
                        <CardDescription>
                           This will be sent to the user's in-app notification bell and as a push notification if they've enabled them.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4 rounded-lg border p-4">
                            <Label className="font-semibold">Recipients</Label>
                             <div className="flex items-center space-x-2">
                                <UserIcon className={cn("text-muted-foreground", sendToAll && "text-primary")} />
                                <Switch id="sendToAll-switch" checked={sendToAll} onCheckedChange={handleSendToAllChange} />
                                <UsersIcon className={cn("text-muted-foreground", sendToAll && "text-primary")} />
                                <Label htmlFor="sendToAll-switch" className={cn(sendToAll && "font-bold text-primary")}>
                                   Send to All Users
                                </Label>
                            </div>
                             <div className="flex items-center space-x-2">
                                <Label htmlFor="batch-select">Or, send to a specific batch:</Label>
                                <Select onValueChange={handleBatchChange} value={selectedBatch} disabled={sendToAll}>
                                    <SelectTrigger id="batch-select" className="w-[180px]">
                                        <SelectValue placeholder="Select Batch Year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {batchYears.map(year => (
                                            <SelectItem key={year} value={year}>{year} Batch</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Label>Or, send to specific users:</Label>
                            </div>
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-start h-auto min-h-10 flex-wrap" disabled={sendToAll || !!selectedBatch}>
                                        {selectedUsers.length > 0 ? (
                                            <div className="flex gap-1 flex-wrap">
                                                {selectedUsers.map(user => (
                                                     <Badge key={user.id} variant="secondary" className="gap-1">
                                                        {user.name}
                                                        <div
                                                            role="button"
                                                            aria-label={`Remove ${user.name}`}
                                                            onClick={(e) => { e.preventDefault(); handleRemoveUser(user.id); }}
                                                            className="rounded-full hover:bg-destructive/20 p-0.5 cursor-pointer"
                                                        >
                                                          <X className="h-3 w-3" />
                                                        </div>
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : "Select users by name, email, or reg no..."}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search user..." />
                                        <CommandList>
                                            <CommandEmpty>No user found.</CommandEmpty>
                                            <CommandGroup>
                                            {filteredUsers.map(user => (
                                                <CommandItem
                                                    key={user.id}
                                                    onSelect={() => handleSelectUser(user)}
                                                    value={`${user.name} ${user.email} ${user.regNo || ''}`}
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{user.name}</span>
                                                        <span className="text-xs text-muted-foreground">{user.email} {user.regNo && `(${user.regNo})`}</span>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
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
                        <SubmitButton sendToAll={sendToAll} recipientCount={selectedUsers.length} batchYear={selectedBatch} />
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
