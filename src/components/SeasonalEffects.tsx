
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Snowfall from 'react-snowfall';
import { getSpecialEvents } from '@/app/actions/manage-effects';
import { SpecialEvent, EffectType } from '@/types';
import './rain.css';


const RainEffect = () => (
    <div className="rain-container">
        {Array.from({ length: 100 }).map((_, i) => (
            <div key={i} className="rain-drop" style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${0.5 + Math.random() * 0.5}s`,
            }}></div>
        ))}
    </div>
);


// Helper component to avoid Suspense boundary issues with useSearchParams
function EffectsManager() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [effects, setEffects] = useState<EffectType[]>([]);
  const [specialMessage, setSpecialMessage] = useState<string | null>(null);
  const [showSpecialMessage, setShowSpecialMessage] = useState(false);
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
    
    const hardcodedEvents = [
        { month: 12, day: 25, effects: ['fireworks', 'confetti'] as EffectType[], message: "Happy birthday To U my dear friend" },
        { month: 1, day: 1, effects: ['confetti'] as EffectType[], message: "Happy New Year!<br/>Welcome 2026<br/><p class='text-2xl mt-4'>Let’s make learning smarter, simpler, and stronger.</p>" },
    ];
    
    let currentEffects: EffectType[] = ['snow'];
    let message: string | null = null;
    let activeEvent = false;

    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const dateString = `${today.getFullYear()}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // Check for custom event first
    const customEvent = customEvents.find(e => e.date === dateString);
    if (customEvent) {
        currentEffects = customEvent.effect === 'none' ? [] : [customEvent.effect];
        message = customEvent.message;
        activeEvent = true;
    } else {
        // Check hardcoded events
        const hardcodedEvent = hardcodedEvents.find(e => e.month === month && e.day === day);
        if (hardcodedEvent) {
            currentEffects = hardcodedEvent.effects;
            message = hardcodedEvent.message;
            activeEvent = true;
        }
    }
    
    // Override with test parameter if present
    if (testParam === 'dec25') {
        const event = hardcodedEvents.find(e => e.month === 12 && e.day === 25);
        if (event) {
            currentEffects = event.effects;
            message = event.message;
            activeEvent = true;
        }
    } else if (testParam === 'jan1') {
        const event = hardcodedEvents.find(e => e.month === 1 && e.day === 1);
        if (event) {
            currentEffects = event.effects;
            message = event.message;
            activeEvent = true;
        }
    } else if (testParam === 'rain') {
        currentEffects = ['rain'];
        message = "Looks like a rainy day!";
        activeEvent = true;
    }


    setEffects(activeEvent ? currentEffects : ['snow']);
    setSpecialMessage(message);
    if (message && activeEvent) {
        const sessionKey = 'specialMessageShown';
        if (!sessionStorage.getItem(sessionKey)) {
             setShowSpecialMessage(true);
             sessionStorage.setItem(sessionKey, 'true');
        }
    }
  }, [searchParams, customEvents]);
  
  const handleOverlayClick = () => {
    setShowSpecialMessage(false);
  };

  return (
    <>
      {showSpecialMessage && specialMessage && (
        <div 
            className={cn(
                "fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm cursor-pointer",
                "animate-in fade-in-0 duration-500"
            )}
            onClick={handleOverlayClick}
        >
            <div className="relative text-center text-white p-8 animate-in zoom-in-75 duration-700">
                <div className="text-5xl md:text-7xl font-extrabold tracking-tight" dangerouslySetInnerHTML={{ __html: specialMessage }} />
            </div>
        </div>
      )}
      
      {effects.includes('snow') && <SnowfallEffect />}
      {effects.includes('fireworks') && <FireworksEffect />}
      {effects.includes('confetti') && <ConfettiEffect />}
      {effects.includes('rain') && <RainEffect />}
    </>
  );
}

const SnowfallEffect = () => (
    <Snowfall
      color="#BFDFFF" // A light, icy blue
      style={{ position: 'fixed', width: '100vw', height: '100vh', zIndex: 100, pointerEvents: 'none' }}
      snowflakeCount={150}
    />
);

const FireworksEffect = () => (
    <>
      <div id="fireworks-container" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 250, pointerEvents: 'none' }}></div>
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
                    origin: { y: 0.6 },
                    zIndex: 2500
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
