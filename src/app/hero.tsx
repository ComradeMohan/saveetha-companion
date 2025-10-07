
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowDown } from 'lucide-react';

const PlayStoreIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="h-5 w-5 mr-2">
        <path fill="currentColor" d="M325.1 236.9c-2.2-1.6-4.9-2.5-7.8-2.5-3.3 0-6.4 1.1-8.9 3.2-5.4 4.5-8.9 11-8.9 18.2s3.5 13.7 8.9 18.2c2.5 2.1 5.6 3.2 8.9 3.2 2.9 0 5.6-.9 7.8-2.5l111.4-81.8c2.9-2.2 4.6-5.5 4.6-9.1 0-3.6-1.7-6.9-4.6-9.1L325.1 236.9zM496 256c0-11.4-3.1-22.1-8.5-31.5l-95.1-164.6C372 24.3 336.9 0 293.4 0H52.2C23.4 0 0 23.4 0 52.2v407.6C0 488.6 23.4 512 52.2 512h343.3c10.5 0 20.3-4.2 27.6-11.5 7-7.2 11.2-17 11.2-27.6V256zM302.5 135.2l-129.5 95.1-66.5-48.4c-2.3-1.6-5-2.6-7.9-2.6-6.5 0-11.9 5.3-11.9 11.9 0 .8.1 1.6.3 2.4l30 134.8-30 134.8c-.2.8-.3 1.6-.3 2.4 0 6.5 5.3 11.9 11.9 11.9 2.9 0 5.6-1 7.9-2.6l66.5-48.4 129.5 95.1c5.2 3.8 11.9 4.2 17.5 1.1 5.6-3.1 9.2-8.9 9.2-15.4V149.4c0-6.5-3.6-12.3-9.2-15.4-5.6-3.1-12.3-2.8-17.5 1.2z" />
    </svg>
);


export default function Hero() {
  return (
    <section id="home" className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center py-20 md:py-32 animate-fade-in md:mt-0 mt-16">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
          Your All-in-One Academic Hub
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
          Welcome to the Saveetha Calculator. Calculate your CGPA, track attendance, find resources, and connect with faculty, all in one place.
        </p>
        <div className="mt-8 flex flex-col justify-center items-center gap-4 animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex flex-col sm:flex-row gap-4">
                 <Button asChild size="lg">
                    <Link href="/signup">Get Started</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                    <Link href="#calculators">Try the Calculators</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                    <Link href="https://univault.live" target="_blank" rel="noopener noreferrer">
                        <PlayStoreIcon />
                        Get it on Play Store
                    </Link>
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
