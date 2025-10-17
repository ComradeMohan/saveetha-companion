
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Loader2, SendHorizonal, X, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface LabAIChatAssistantProps {
  isOpen: boolean;
  onToggle: () => void;
  currentLanguageName: string;
  currentQuestionText: string;
  getCurrentCodeSnippet: () => string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function LabAIChatAssistant({
  isOpen,
  onToggle,
  currentLanguageName,
  currentQuestionText,
  getCurrentCodeSnippet,
}: LabAIChatAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const codeSnippet = getCurrentCodeSnippet();

    try {
        // This is a placeholder for a real API call.
        // In a real application, you would send the `codeSnippet`, `currentLanguageName`, 
        // `currentQuestionText`, and `input` to your AI backend.
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const botResponse: ChatMessage = {
            role: 'assistant',
            content: `This is a simulated AI response for ${currentLanguageName}. Based on your question "${input}" and the provided code, here is a suggestion... (This is a mock response, as no AI flow is currently implemented for this feature).`
        };
        setMessages(prev => [...prev, botResponse]);

    } catch (error) {
        console.error("AI Assistant Error:", error);
        toast({ title: 'Error', description: 'Could not get a response from the AI assistant.', variant: 'destructive' });
        const errorMessage: ChatMessage = { role: 'assistant', content: "Sorry, I encountered an error. Please try again." };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className={cn("absolute top-2 right-2 bottom-2 z-20 transition-transform duration-300 ease-in-out", 
      isOpen ? 'translate-x-0' : 'translate-x-[calc(100%+1rem)]'
    )}>
      <Card className="w-80 h-full flex flex-col shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between p-3 border-b">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> AI Assistant
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggle}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
           <ScrollArea className="flex-1 p-3">
            <div className="space-y-4">
              <div className="p-3 bg-secondary rounded-lg text-xs text-muted-foreground">
                <p>Hi! I'm your AI assistant. I can see you're working on a {currentLanguageName} program. Ask me anything about your code!</p>
              </div>
              {messages.map((msg, index) => (
                <div key={index} className={cn("flex", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div className={cn("p-2 rounded-lg max-w-[90%] text-sm", msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary')}>
                    {msg.content}
                  </div>
                </div>
              ))}
               {isLoading && (
                 <div className="flex justify-start">
                  <div className="p-2 rounded-lg max-w-[90%] text-sm bg-secondary flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
                  </div>
                </div>
              )}
            </div>
           </ScrollArea>
        </CardContent>
        <CardFooter className="p-2 border-t">
          <form onSubmit={handleSendMessage} className="w-full">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="resize-none border-0 shadow-none focus-visible:ring-0 text-sm"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            <Button type="submit" size="sm" className="w-full mt-1" disabled={isLoading || !input.trim()}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <SendHorizonal className="h-4 w-4"/>}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
