
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const messages = [
    { name: 'John Doe', email: 'john@example.com', message: 'I have a question about the CGPA calculator.', status: 'Unread', received: '10 minutes ago' },
    { name: 'Jane Smith', email: 'jane@example.com', message: 'Can I request a new feature?', status: 'Read', received: '2 hours ago' },
    { name: 'Peter Jones', email: 'peter@example.com', message: 'Just wanted to say thank you for this amazing app!', status: 'Read', received: '1 day ago' },
];


export default function AdminMessagesPage() {
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
                           {messages.map((message) => (
                            <TableRow key={message.email}>
                                <TableCell>
                                    <div className="font-medium">{message.name}</div>
                                    <div className="text-sm text-muted-foreground">{message.email}</div>
                                </TableCell>
                                <TableCell>{message.message}</TableCell>
                                <TableCell>
                                    <Badge variant={message.status === 'Unread' ? 'default' : 'secondary'}>
                                        {message.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{message.received}</TableCell>
                            </TableRow>
                           ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
