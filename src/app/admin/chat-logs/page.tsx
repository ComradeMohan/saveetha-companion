
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Bot, User, MessagesSquare } from 'lucide-react';
import { getChatLogs, type ChatLog } from '@/app/actions/get-chat-logs';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function AdminChatLogsPage() {
  const [logs, setLogs] = useState<ChatLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      const chatLogs = await getChatLogs();
      setLogs(chatLogs);
      setLoading(false);
    };
    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    if (!searchTerm) {
      return logs;
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return logs.filter(log =>
      log.userName.toLowerCase().includes(lowercasedTerm) ||
      log.messages.some(msg => msg.content.toLowerCase().includes(lowercasedTerm))
    );
  }, [logs, searchTerm]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">AI Assistant Chat Logs</h2>
        <p className="text-muted-foreground">Review conversations to improve the chatbot's knowledge base.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Conversations</CardTitle>
          <CardDescription>A list of all recorded chat sessions from the AI assistant.</CardDescription>
          <div className="relative pt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by user name or message content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-1/2"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredLogs.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {filteredLogs.map(log => (
                <AccordionItem key={log.id} value={log.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex flex-col text-left">
                            <span className="font-semibold">{log.userName}</span>
                            <span className="text-xs text-muted-foreground">
                                {log.createdAt ? formatDistanceToNow(new Date(log.createdAt), { addSuffix: true }) : 'N/A'}
                            </span>
                        </div>
                        <Badge variant="outline">{log.messages.length} messages</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 p-4 border rounded-md max-h-96 overflow-y-auto">
                        {log.messages.map((message, index) => (
                             <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                                {message.role === 'bot' && (
                                    <Avatar className="h-7 w-7">
                                    <AvatarFallback><Bot className="h-4 w-4"/></AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={`rounded-lg p-2.5 max-w-xs sm:max-w-md text-sm ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                                    <p className="whitespace-pre-wrap">{message.content}</p>
                                </div>
                                {message.role === 'user' && (
                                    <Avatar className="h-7 w-7">
                                    <AvatarFallback>{log.userName?.[0] || <User className="h-4 w-4"/>}</AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
             <div className="text-center text-muted-foreground py-16">
                <MessagesSquare className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4">
                    {searchTerm ? "No logs match your search." : "No chat logs found."}
                </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
