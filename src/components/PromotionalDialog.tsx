
'use client';

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import Link from 'next/link';

const PROMO_STORAGE_KEY = 'promoDialogLastClosed';
const HIDE_DURATION = 30 * 60 * 1000; // 30 minutes
const IMAGE_URL = '/app_promotion.png';

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
      }, 2500); // Increased delay slightly

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(PROMO_STORAGE_KEY, Date.now().toString());
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent
        side="left"
        className="p-0 border-0 w-[350px] sm:w-[400px] bg-background/80 backdrop-blur-lg"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>App Promotion</SheetTitle>
          <SheetDescription>Check out our mobile app.</SheetDescription>
        </SheetHeader>

        <div className="relative h-full w-full">
           <Link
            href="https://play.google.com/store/apps/details?id=com.simats.univault"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClose}
            className="block h-full w-full"
          >
            {isOpen && (
              <img
                src={IMAGE_URL}
                alt="Promotional Image for Univault App"
                width={400}
                height={800}
                loading="eager"
                className="object-cover w-full h-full fade-in loaded"
              />
            )}
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
