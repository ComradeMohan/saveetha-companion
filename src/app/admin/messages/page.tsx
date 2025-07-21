
'use client';

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail } from "lucide-react";
import { collection, orderBy, query, doc, updateDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface Message {
    id: string;
    name: string;
    email: string;
    message: string;
    status: 'Unread' | 'Read';
    createdAt: string;
}

export default function AdminMessagesPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const { toast } = useToast();

    const fetchMessages = useCallback(async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'contact-messages'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const data: Message[] = [];
            querySnapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() } as Message);
            });
            setMessages(data);
        } catch (error) {
            console.error("Error fetching messages:", error);
            toast({
                title: "Error",
                description: "Could not fetch messages.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    const handleRowClick = async (message: Message) => {
        setSelectedMessage(message);
        if (message.status === 'Unread') {
            try {
                const messageRef = doc(db, 'contact-messages', message.id);
                await updateDoc(messageRef, { status: 'Read' });
                // Optimistically update the UI before refetching
                setMessages(prev => prev.map(m => m.id === message.id ? {...m, status: 'Read'} : m));
            } catch (error) {
                console.error("Error marking message as read:", error);
            }
        }
    };
    
    const handleStatusToggle = async () => {
        if (!selectedMessage) return;

        const newStatus = selectedMessage.status === 'Read' ? 'Unread' : 'Read';
        try {
            const messageRef = doc(db, 'contact-messages', selectedMessage.id);
            await updateDoc(messageRef, { status: newStatus });
            toast({
                title: "Status Updated",
                description: `Message marked as ${newStatus.toLowerCase()}.`
            });
            // Update local state to reflect change immediately in the sheet
            setSelectedMessage(prev => prev ? { ...prev, status: newStatus } : null);
             // Optimistically update the main list as well
            setMessages(prev => prev.map(m => m.id === selectedMessage.id ? {...m, status: newStatus} : m));
        } catch (error) {
            console.error("Error updating message status:", error);
            toast({
                title: "Error",
                description: "Could not update message status.",
                variant: "destructive"
            });
        }
    }


    return (
        <>
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <h2 className="text-3xl font-bold tracking-tight">Contact Form Messages</h2>

                <Card>
                    <CardHeader>
                        <CardTitle>Inbox</CardTitle>
                        <CardDescription>
                            Messages submitted through the contact form. Click a row to view details.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Sender</TableHead>
                                    <TableHead>Message</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Received</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                        </TableCell>
                                    </TableRow>
                                ) : messages.length > 0 ? (
                                    messages.map((message) => (
                                        <TableRow 
                                            key={message.id} 
                                            className={`cursor-pointer ${message.status === 'Unread' ? 'font-bold' : ''}`}
                                            onClick={() => handleRowClick(message)}
                                        >
                                            <TableCell>
                                                <div className="font-medium">{message.name}</div>
                                                <div className={`text-sm ${message.status === 'Unread' ? 'text-foreground/80' : 'text-muted-foreground'}`}>{message.email}</div>
                                            </TableCell>
                                            <TableCell className="max-w-[400px] truncate">{message.message}</TableCell>
                                            <TableCell>
                                                <Badge variant={message.status === 'Unread' ? 'default' : 'secondary'}>
                                                    {message.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            No messages found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            <Sheet open={!!selectedMessage} onOpenChange={(isOpen) => !isOpen && setSelectedMessage(null)}>
                <SheetContent>
                    {selectedMessage && (
                        <>
                            <SheetHeader className="mb-6">
                                <SheetTitle>Message Details</SheetTitle>
                                <SheetDescription>
                                    From: {selectedMessage.name}
                                </SheetDescription>
                            </SheetHeader>
                            <div className="space-y-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground"/>
                                    <a href={`mailto:${selectedMessage.email}`} className="text-primary hover:underline">{selectedMessage.email}</a>
                                </div>
                                <div className="flex items-center gap-2">
                                     <Badge variant={selectedMessage.status === 'Unread' ? 'default' : 'secondary'}>
                                        {selectedMessage.status}
                                     </Badge>
                                    <span className="text-muted-foreground">Received {format(new Date(selectedMessage.createdAt), 'PPP p')}</span>
                                </div>
                                 <div className="border-t pt-4">
                                    <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                                </div>
                            </div>
                            <SheetFooter className="mt-8">
                                <Button 
                                    onClick={handleStatusToggle}
                                    variant="outline"
                                >
                                    Mark as {selectedMessage.status === 'Read' ? 'Unread' : 'Read'}
                                </Button>
                            </SheetFooter>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </>
    );
}
