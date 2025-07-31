
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowDown } from 'lucide-react';

export default function Hero() {
  return (
    <section id="home" className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center py-20 md:py-32 animate-fade-in md:mt-0 mt-16">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
          Your All-in-One Academic Hub
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
          Welcome to the Saveetha Companion. Calculate your CGPA, track attendance, find resources, and connect with faculty, all in one place.
        </p>
        <div className="mt-8 flex flex-col justify-center items-center gap-4 animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex flex-col sm:flex-row gap-4">
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
