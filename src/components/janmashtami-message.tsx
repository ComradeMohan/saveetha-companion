
'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'janmashtamiMessageLastSeen';
const ONE_HOUR = 60 * 60 * 1000;

const Confetti = () => {
    // Peacock Blue, Saffron/Yellow, Gold
    const colors = ['#00A5C6', '#FFD700', '#FF9933']; 
    const confettiElements = Array.from({ length: 100 }).map((_, i) => {
        const style = {
            left: `${Math.random() * 100}%`,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
            transform: `scale(${Math.random() * 0.5 + 0.5})`
        };
        return <div key={i} className="confetti" style={style}></div>;
    });
    return <div className="confetti-container">{confettiElements}</div>;
};

export default function JanmashtamiMessage() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const lastSeen = localStorage.getItem(STORAGE_KEY);
    const now = Date.now();

    if (!lastSeen || now - parseInt(lastSeen) > ONE_HOUR) {
      setShowModal(true);
      localStorage.setItem(STORAGE_KEY, now.toString());

      const timer = setTimeout(() => {
        setShowModal(false);
      }, 6000); // Hide after 6 seconds

      return () => clearTimeout(timer);
    }
  }, []);

  if (!showModal) {
    return null;
  }

  return (
    <div className={cn(
        "fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm",
        "animate-in fade-in-0 duration-500",
        !showModal && "animate-out fade-out-0 duration-500 fill-mode-forwards"
    )}>
        <Confetti />
        <div className="relative text-center text-white p-8 animate-in zoom-in-75 duration-700">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
                Happy Sri Krishna Janmashtami!
            </h1>
            <p className="mt-4 text-lg md:text-xl text-white/80 max-w-3xl">
                May the divine blessings of Lord Krishna fill your life with joy, love, and prosperity. Wishing you and your family a blessed and joyous celebration!
            </p>
        </div>
    </div>
  );
}
