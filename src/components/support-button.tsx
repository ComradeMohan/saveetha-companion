
'use client';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function SupportButton() {
  return (
    <div className="hidden md:block fixed bottom-6 right-6 z-50">
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button asChild size="icon" className="rounded-full h-14 w-14 shadow-lg">
                        <Link href="/contact">
                            <MessageSquare className="h-7 w-7" />
                            <span className="sr-only">Contact Support</span>
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                    <p>Contact Support</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    </div>
  );
}
