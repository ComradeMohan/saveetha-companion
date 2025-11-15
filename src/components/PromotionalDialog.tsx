
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import Link from 'next/link';

const PROMO_STORAGE_KEY = 'promoDialogLastClosed';
const HIDE_DURATION = 30 * 60 * 1000; // 30 minutes
const IMAGE_URL = 'https://i.ibb.co/5WzMJGkT/7975dff7-4ffa-4bb3-bd91-dafa1985f33f.png';

export default function PromotionalDialog() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const lastClosed = localStorage.getItem(PROMO_STORAGE_KEY);
    const now = Date.now();

    if (!lastClosed || now - parseInt(lastClosed, 10) > HIDE_DURATION) {
      const timer = setTimeout(() => {
        // Preload the image
        const img = new Image();
        img.src = IMAGE_URL;
        img.onload = () => {
          // Only show the dialog once the image is loaded
          setIsOpen(true);
        };
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(PROMO_STORAGE_KEY, Date.now().toString());
  };

  const handleDialogInteraction = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="p-0 border-0 max-w-md bg-transparent shadow-none dialog-animate"
        onClick={handleDialogInteraction}
        style={{ backgroundColor: 'hsl(220.71deg 100% 5.49% / 47%)' }}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Promotional</DialogTitle>
          <DialogDescription>Promo modal</DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Link
            href="https://devpulseweb.netlify.app/ComradeMohan"
            target="_blank"
            rel="noopener noreferrer"
          >
            {isOpen && (
              <img
                src={IMAGE_URL}
                alt="Promotional Image"
                width={500}
                height={600}
                loading="eager" // Load eagerly since we're waiting for it
                className="rounded-lg cursor-pointer object-cover w-full h-auto fade-in loaded"
              />
            )}
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
