
'use client';

import { useState, useRef, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Bot, FileText, Loader2, Send, User, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { askTutor, TutorOutput } from '@/ai/flows/tutor-flow';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

interface Message {
  role: 'user' | 'bot';
  content: string;
  sources?: TutorOutput['sources'];
}

export function AiChatPopover() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (viewportRef.current) {
        viewportRef.current.scrollTo({
            top: viewportRef.current.scrollHeight,
            behavior: 'smooth',
        });
    }
  }, [messages, loading]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const result = await askTutor({ question: input });
      const botMessage: Message = { role: 'bot', content: result.answer, sources: result.sources };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error asking tutor:', error);
      const errorMessage: Message = { role: 'bot', content: 'Sorry, I encountered an error. Please ensure knowledge has been fed in the admin panel and try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && messages.length === 0) {
      // Add initial greeting message when chat is opened for the first time
      setTimeout(() => {
        setMessages([
          { role: 'bot', content: `Hi ${user?.displayName?.split(' ')[0] || 'there'}! How can I help you today? Ask me anything about your concept maps.` }
        ]);
      }, 200);
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button size="icon" className="rounded-full h-14 w-14 shadow-lg">
            <Bot className="h-7 w-7" />
            <span className="sr-only">Open AI Tutor</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        className="w-80 sm:w-96 rounded-xl p-0"
        sideOffset={10}
      >
        <div className="flex flex-col h-[60vh]">
          <div className="flex items-center justify-between p-3 border-b">
            <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 border-2 border-primary">
                    <AvatarFallback><Bot className="h-4 w-4"/></AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-semibold">AI Tutor</p>
                    <p className="text-xs text-muted-foreground">Online</p>
                </div>
            </div>
             <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(false)}>
                <X className="h-4 w-4"/>
             </Button>
          </div>
          <ScrollArea className="flex-1 p-4" viewportRef={viewportRef}>
             <div className="space-y-6">
              {messages.map((message, index) => (
                <div key={index} className={cn("flex items-start gap-3", message.role === 'user' ? 'justify-end' : '')}>
                  {message.role === 'bot' && (
                    <Avatar className="h-7 w-7">
                      <AvatarFallback><Bot className="h-4 w-4"/></AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn("rounded-lg p-2.5 max-w-xs text-sm", message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary')}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.role === 'bot' && message.sources && message.sources.length > 0 && (
                        <div className="mt-2.5 border-t pt-2">
                            <h4 className="text-xs font-semibold mb-1.5">Sources:</h4>
                            <div className="space-y-1">
                                {message.sources.map(source => (
                                    <Link key={source.url} href={`/view-pdf/${encodeURIComponent(source.url)}`} target="_blank" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                                        <FileText className="h-3 w-3" />
                                        <span className="truncate">{source.title}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <Avatar className="h-7 w-7">
                      <AvatarFallback>{user?.displayName?.[0] || <User className="h-4 w-4"/>}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {loading && (
                 <div className="flex items-start gap-3">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback><Bot className="h-4 w-4"/></AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg p-2.5 max-w-xs text-sm bg-secondary flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Thinking...</span>
                    </div>
                 </div>
              )}
            </div>
          </ScrollArea>
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 border-t p-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1"
              disabled={loading}
              autoComplete="off"
            />
            <Button type="submit" size="icon" disabled={loading || !input.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </PopoverContent>
    </Popover>
  );
}
