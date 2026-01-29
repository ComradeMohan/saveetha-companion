
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import NextImage from 'next/image';

const PROMO_STORAGE_KEY = 'promoDialogLastClosed';
const HIDE_DURATION = 30 * 60 * 1000; // 30 minutes
const IMAGE_URL = '/app_promotion.png';

export default function PromotionalDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

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
      }, 3500); // Delay before showing

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(PROMO_STORAGE_KEY, Date.now().toString());
  };
  
  useEffect(() => {
    if (isOpen) {
        // slight delay to allow transition to start
        const timer = setTimeout(() => setIsLoaded(true), 50);
        return () => clearTimeout(timer);
    } else {
        setIsLoaded(false);
    }
  }, [isOpen]);


  if (!isOpen && !isLoaded) return null;

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-50 w-80 rounded-2xl bg-card shadow-2xl border transition-all duration-500 ease-in-out',
        'transform-gpu',
        isOpen ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
      )}
    >
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="absolute top-2 right-2 h-7 w-7 rounded-full bg-background/50 text-muted-foreground hover:bg-background z-10"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close promotion</span>
        </Button>
        <Link
          href="https://play.google.com/store/apps/details?id=com.simats.univault"
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClose}
          className="block overflow-hidden rounded-2xl"
        >
          <NextImage
            src={IMAGE_URL}
            alt="Promotional Image for Univault App"
            width={320}
            height={400}
            className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
          />
        </Link>
      </div>
    </div>
  );
}
