'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Helper component to avoid Suspense boundary issues with useSearchParams
function EffectsManager() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [effect, setEffect] = useState<string>('snow'); // Default to snow
  const [specialMessage, setSpecialMessage] = useState<string | null>(null);

  useEffect(() => {
    const testDate = searchParams.get('test_date');
    const today = new Date();
    const month = today.getMonth() + 1; // getMonth() is 0-indexed
    const day = today.getDate();

    let currentEffect = 'snow';
    let message: string | null = null;
    let toastId: string | undefined;

    const checkDate = (m: number, d: number) => month === m && day === d;
    
    // Logic for live dates or test dates
    if (testDate === 'dec25' || checkDate(12, 25)) {
      currentEffect = 'fireworks';
      message = "Many more happy returns of the day!";
    } else if (testDate === 'dec31' || checkDate(12, 31)) {
      currentEffect = 'fireworks_countdown';
    } else if (testDate === 'jan1' || checkDate(1, 1)) {
      currentEffect = 'confetti';
      message = "Happy New Year!";
    }

    setEffect(currentEffect);
    setSpecialMessage(message);

    // Handle countdown toast for NYE
    if (currentEffect === 'fireworks_countdown') {
        const newYear = new Date(today.getFullYear() + 1, 0, 1);
        const updateCountdown = () => {
            const now = new Date();
            const diff = newYear.getTime() - now.getTime();

            if (diff <= 0) {
                if (toastId) toast.dismiss(toastId);
                setEffect('confetti'); // Switch to confetti on New Year
                setSpecialMessage("Happy New Year!");
                return;
            }

            const hours = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0');
            const minutes = String(Math.floor((diff / 1000 / 60) % 60)).padStart(2, '0');
            const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
            
            const description = `${hours}:${minutes}:${seconds} until New Year!`;
            
            if (toastId) {
                toast.update(toastId, { description });
            } else {
                const { id } = toast({
                    title: 'New Year Countdown ⏳',
                    description,
                    duration: Infinity, // Keep it open until dismissed
                });
                toastId = id;
            }
        };
        
        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }
  }, [searchParams, toast]);

  if (specialMessage) {
     return (
        <>
            <div className={cn(
                "fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm",
                "animate-in fade-in-0 duration-500"
            )}>
                <div className="relative text-center text-white p-8 animate-in zoom-in-75 duration-700">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
                        {specialMessage}
                    </h1>
                </div>
            </div>
            {effect === 'fireworks' && <FireworksEffect />}
            {effect === 'confetti' && <ConfettiEffect />}
        </>
    );
  }

  return (
    <>
      {effect === 'snow' && <SnowfallEffect />}
      {effect === 'fireworks' && <FireworksEffect />}
      {effect === 'fireworks_countdown' && <FireworksEffect />}
      {effect === 'confetti' && <ConfettiEffect />}
    </>
  );
}

const SnowfallEffect = () => (
    <>
        <Script id="magic-snowflakes" src="https://unpkg.com/magic-snowflakes/dist/snowflakes.min.js" strategy="lazyOnload" />
        <Script id="magic-snowflakes-init" strategy="lazyOnload">
            {`
                if (window.Snowflakes) {
                    new window.Snowflakes({
                        color: "#BFDFFF",
                        count: 60,
                        minSize: 8,
                        maxSize: 18,
                        speed: 1.2,
                        zIndex: 500
                    });
                }
            `}
        </Script>
    </>
);

const FireworksEffect = () => (
    <>
      <div id="fireworks-container" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1000, pointerEvents: 'none' }}></div>
      <Script src="https://cdn.jsdelivr.net/npm/fireworks-js@2/dist/index.umd.js" strategy="lazyOnload" />
      <Script id="fireworks-init" strategy="lazyOnload">
        {`
            const container = document.getElementById('fireworks-container');
            if (container && window.Fireworks) {
                const fireworks = new window.Fireworks.default(container, {
                    intensity: 30,
                    traceSpeed: 10,
                    delay: { min: 30, max: 60 }
                });
                fireworks.start();
                
                const sessionKey = 'fireworksShown';
                if (!sessionStorage.getItem(sessionKey)) {
                    setTimeout(() => {
                        fireworks.stop();
                    }, 8000); // Stop after 8 seconds for one-time effect
                    sessionStorage.setItem(sessionKey, 'true');
                }
            }
        `}
      </Script>
    </>
);

const ConfettiEffect = () => (
    <Script id="confetti-init" src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js" strategy="lazyOnload"
        onLoad={() => {
            if (window.confetti) {
                 window.confetti({
                    particleCount: 250,
                    spread: 100,
                    origin: { y: 0.6 }
                });
            }
        }}
    />
);

// Main component wrapped in Suspense for useSearchParams
export default function SeasonalEffects() {
    return (
        <Suspense fallback={null}>
            <EffectsManager />
        </Suspense>
    );
}

// Add this to your global types or a declarations file if needed
declare global {
  interface Window {
    Snowflakes: any;
    Fireworks: any;
    confetti: any;
  }
}
