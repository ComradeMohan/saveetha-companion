
'use client';

import Header from '@/components/header';
import Footer from '@/components/footer';
import Hero from '@/components/hero';
import { useAuth } from '@/hooks/use-auth';
import Features from '@/components/features';
import Stats from '@/components/stats';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const CgpaCalculator = dynamic(() => import('@/components/cgpa-calculator'), {
  loading: () => <Skeleton className="w-full h-[400px]" />,
  ssr: false,
});
const AttendanceCalculator = dynamic(() => import('@/components/attendance-calculator'), {
  loading: () => <Skeleton className="w-full h-[400px]" />,
  ssr: false,
});
const ConceptMapFinder = dynamic(() => import('@/components/concept-map-finder'), {
  loading: () => <Skeleton className="w-full h-[200px]" />,
});
const FacultyDirectory = dynamic(() => import('@/components/faculty-directory'), {
  loading: () => <Skeleton className="w-full h-[200px]" />,
});

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {!user && (
            <Hero />
        )}

        <section id="calculators" className="py-12 md:py-16 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-10">Calculators</h2>
            <div className="grid gap-8 lg:grid-cols-2 max-w-5xl mx-auto">
              <CgpaCalculator />
              <AttendanceCalculator />
            </div>
          </div>
        </section>

        <section id="concepts" className="py-12 md:py-16 bg-card/50 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="container mx-auto px-4">
            <ConceptMapFinder />
          </div>
        </section>

        <section id="faculty" className="py-12 md:py-16 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="container mx-auto px-4">
            <FacultyDirectory />
          </div>
        </section>
        
        {!user && (
            <>
                <Features />
                <Stats />
                <section id="contact" className="py-12 md:py-16 text-center">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold tracking-tight">Need Help?</h2>
                        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                            If you're having trouble signing up or logging in, please don't hesitate to contact us.
                        </p>
                        <Button asChild size="lg" className="mt-6">
                            <Link href="/contact">
                                Contact Support <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </div>
                </section>
            </>
        )}
      </main>
      <Footer />
    </div>
  );
}
