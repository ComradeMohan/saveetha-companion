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

export default function PromotionalDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const lastClosed = localStorage.getItem(PROMO_STORAGE_KEY);
    const now = Date.now();

    if (!lastClosed || now - parseInt(lastClosed, 10) > HIDE_DURATION) {
      const timer = setTimeout(() => {
        setIsOpen(true);
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
                src="https://i.ibb.co/Zp3pwJY9/3e64fe13-1104-482c-bf8d-e83ad4250145.png"
                alt="Promotional Image"
                width={500}
                height={600}
                loading="lazy"
                onLoad={() => setLoaded(true)}
                className={`rounded-lg cursor-pointer object-cover w-full h-auto fade-in ${
                  loaded ? 'loaded' : ''
                }`}
              />
            )}
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
