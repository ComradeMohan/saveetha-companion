
'use client';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MessageSquare } from 'lucide-react';
import { Dialog, DialogTrigger } from './ui/dialog';
import Chatbot from './chatbot';

export default function ChatbotTrigger() {
  return (
    <div className="hidden md:block fixed bottom-6 right-6 z-50">
      <Dialog>
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                        <Button size="icon" className="rounded-full h-14 w-14 shadow-lg">
                            <MessageSquare className="h-7 w-7" />
                            <span className="sr-only">Open Chatbot</span>
                        </Button>
                    </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent side="left">
                    <p>AI Assistant</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
        <Chatbot />
      </Dialog>
    </div>
  );
}
