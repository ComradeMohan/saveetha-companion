
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import SnowfallEffect from './SnowfallEffect';
import { getSpecialEvents } from '@/app/actions/manage-effects';
import { SpecialEvent } from '@/types';


// Helper component to avoid Suspense boundary issues with useSearchParams
function EffectsManager() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [effect, setEffect] = useState<string>('snow');
  const [specialMessage, setSpecialMessage] = useState<string | null>(null);
  const [customEvents, setCustomEvents] = useState<SpecialEvent[]>([]);

  useEffect(() => {
    const fetchCustomEvents = async () => {
        const events = await getSpecialEvents();
        setCustomEvents(events);
    };
    fetchCustomEvents();
  }, []);

  useEffect(() => {
    const testParam = searchParams.get('test_date');
    let toastId: string | undefined;

    const hardcodedEvents = [
        { month: 12, day: 25, effect: 'fireworks', message: "Happy birthday To U my dear friend" },
        { month: 12, day: 31, effect: 'fireworks_countdown', message: null },
        { month: 1, day: 1, effect: 'confetti', message: "Happy New Year!" },
    ];
    
    let currentEffect = 'snow';
    let message: string | null = null;
    let activeEvent = false;

    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const dateString = `${today.getFullYear()}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // Check for custom event first
    const customEvent = customEvents.find(e => e.date === dateString);
    if (customEvent) {
        currentEffect = customEvent.effect;
        message = customEvent.message;
        activeEvent = true;
    } else {
        // Check hardcoded events
        const hardcodedEvent = hardcodedEvents.find(e => e.month === month && e.day === day);
        if (hardcodedEvent) {
            currentEffect = hardcodedEvent.effect;
            message = hardcodedEvent.message;
            activeEvent = true;
        }
    }
    
    // Override with test parameter if present
    if (testParam === 'dec25') {
        currentEffect = 'fireworks';
        message = "Happy birthday To U my dear friend";
        activeEvent = true;
    } else if (testParam === 'jan1') {
        currentEffect = 'confetti';
        message = "Happy New Year!";
        activeEvent = true;
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
                setEffect('confetti');
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
                    duration: Infinity,
                });
                toastId = id;
            }
        };
        
        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }
  }, [searchParams, toast, customEvents]);

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

export default function SeasonalEffects() {
    return (
        <Suspense fallback={null}>
            <EffectsManager />
        </Suspense>
    );
}

declare global {
  interface Window {
    Fireworks: any;
    confetti: any;
  }
}
