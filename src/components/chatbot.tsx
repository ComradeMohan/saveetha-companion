
'use client';

import { useState } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Loader2, Send, Bot, User } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback } from './ui/avatar';
import { askAssistant } from '@/ai/flows/assistant-flow';
import type { AssistantInput } from '@/ai/flows/assistant-flow';

interface Message {
  role: 'user' | 'bot';
  content: string;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', content: "Hello! I'm the Saveetha Assistant. How can I help you today? You can ask me about the website's features or general college info." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const history: AssistantInput['history'] = newMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const result = await askAssistant({ history });
      const botMessage: Message = { role: 'bot', content: result.content };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error asking assistant:', error);
      const errorMessage: Message = { role: 'bot', content: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-md h-[70vh] flex flex-col">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
            <Bot /> AI Assistant
        </DialogTitle>
        <DialogDescription>
          Ask questions and get help navigating the site.
        </DialogDescription>
      </DialogHeader>
      
      <ScrollArea className="flex-1 pr-4 -mr-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
              {message.role === 'bot' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                </Avatar>
              )}
              <div className={`rounded-lg p-3 max-w-[80%] text-sm ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === 'user' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback><User className="h-5 w-5"/></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {loading && (
             <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                </Avatar>
                <div className="rounded-lg p-3 max-w-lg bg-secondary flex items-center gap-2 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Thinking...</span>
                </div>
             </div>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSendMessage} className="flex items-center gap-2 border-t pt-4">
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
    </DialogContent>
  );
}
