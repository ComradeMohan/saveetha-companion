'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const PROMO_STORAGE_KEY = 'promoDialogLastClosed';
const HIDE_DURATION = 30 * 60 * 1000; // 30 minutes

export default function PromotionalDialog() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const lastClosed = localStorage.getItem(PROMO_STORAGE_KEY);
    const now = new Date().getTime();

    if (!lastClosed || now - parseInt(lastClosed, 10) > HIDE_DURATION) {
      // Use a timeout to delay the modal appearance slightly
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500); // 1.5-second delay

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(PROMO_STORAGE_KEY, new Date().getTime().toString());
  };
  
  const handleDialogInteraction = (e: React.MouseEvent) => {
    // This allows clicks on the link to work without closing the dialog
    e.stopPropagation();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="p-0 border-0 max-w-md bg-transparent shadow-none">
        <div className="relative" onClick={handleDialogInteraction}>
           <Link href="https://devpulseweb.netlify.app/ComradeMohan" target="_blank" rel="noopener noreferrer">
             <Image
                src="https://i.ibb.co/bF0tY3D/IMG-20240725-WA0001-fotor-2024072520552.jpg"
                alt="Promotional Image for ComradeMohan"
                width={500}
                height={600}
                className="rounded-lg cursor-pointer"
             />
           </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
                e.stopPropagation();
                handleClose();
            }}
            className="absolute top-2 right-2 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
