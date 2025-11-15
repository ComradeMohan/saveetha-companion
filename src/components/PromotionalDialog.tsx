
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
      <DialogContent className="p-0 border-0 max-w-md bg-transparent shadow-none" onClick={handleDialogInteraction}>
        <DialogHeader className="sr-only">
          <DialogTitle>Promotional Offer</DialogTitle>
          <DialogDescription>
            A promotional image linking to an external website. Click the image to learn more or the close button to dismiss.
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
           <Link href="https://devpulseweb.netlify.app/ComradeMohan" target="_blank" rel="noopener noreferrer">
             {/* eslint-disable-next-line @next/next/no-img-element */}
             <img
                src="https://i.ibb.co/Zp3pwJY9/3e64fe13-1104-482c-bf8d-e83ad4250145.png"
                alt="Promotional Image for ComradeMohan"
                width={500}
                height={600}
                className="rounded-lg cursor-pointer object-cover w-full h-auto"
             />
           </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
