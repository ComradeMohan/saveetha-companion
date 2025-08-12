
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowDown } from 'lucide-react';

export default function Hero() {
  return (
    <section id="home" className="relative flex min-h-screen animate-fade-in items-center justify-center">
      <div className="container mx-auto flex flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="flex flex-col items-center gap-4">
            <h1 className="animate-slide-in-up text-4xl font-extrabold tracking-tight lg:text-5xl" style={{ animationDelay: '0.1s' }}>
                Your All-in-One Academic Hub
            </h1>
            <p className="mt-4 max-w-2xl animate-slide-in-up text-lg text-muted-foreground" style={{ animationDelay: '0.2s' }}>
                Welcome to the Saveetha Companion. Calculate your CGPA, track attendance, find resources, and connect with faculty, all in one place.
            </p>
        </div>
        <div className="mt-8 flex animate-slide-in-up flex-col items-center justify-center gap-4" style={{ animationDelay: '0.3s' }}>
            <div className="flex flex-col gap-4 sm:flex-row">
                 <Button asChild size="lg">
                    <Link href="/signup">Get Started</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                    <Link href="#calculators">Try the Calculators</Link>
                </Button>
            </div>
        </div>
      </div>
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-slide-in-up" style={{ animationDelay: '0.5s' }}>
        <a href="#calculators" aria-label="Scroll to calculators">
          <ArrowDown className="h-8 w-8 text-muted-foreground animate-bounce" />
        </a>
      </div>
    </section>
  );
}
