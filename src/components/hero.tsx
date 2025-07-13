import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Hero() {
  return (
    <section id="home" className="py-20 md:py-32">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Your All-in-One Academic Hub
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Welcome to the Saveetha Companion. Calculate your CGPA, track attendance, find resources, and connect with faculty, all in one place.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="#calculators">Get Started</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="#faculty">Find Faculty</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
