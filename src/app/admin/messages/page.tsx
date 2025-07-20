
'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

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
    const { toast } = useToast();

    useEffect(() => {
        const q = query(collection(db, 'contact-messages'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const data: Message[] = [];
            querySnapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() } as Message);
            });
            setMessages(data);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching messages:", error);
            toast({
                title: "Error",
                description: "Could not fetch messages.",
                variant: "destructive"
            });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [toast]);

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <h2 className="text-3xl font-bold tracking-tight">Contact Form Messages</h2>

            <Card>
                <CardHeader>
                    <CardTitle>Inbox</CardTitle>
                    <CardDescription>
                        Messages submitted through the contact form.
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
                                    <TableRow key={message.id} className={message.status === 'Unread' ? 'font-bold' : ''}>
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
    );
}
