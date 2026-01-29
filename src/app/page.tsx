'use client';

import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import Features from '@/components/features';
import Stats from '@/components/stats';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calculator, LogIn } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Testimonials } from '@/components/testimonials';
import Hero from '@/components/hero';
import { PromotionCard } from '@/components/promotion-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Dynamic imports for the logged-in dashboard view
const CgpaCalculator = dynamic(() => import('@/components/cgpa-calculator'), {
  loading: () => <Skeleton className="w-full h-[400px]" />,
  ssr: false,
});
const SubjectWiseAttendanceCalculator = dynamic(() => import('@/components/subject-wise-attendance-calculator'), {
  loading: () => <Skeleton className="w-full h-[400px]" />,
  ssr: false,
});
const ConceptMapFinder = dynamic(() => import('@/components/concept-map-finder'), {
  loading: () => <Skeleton className="w-full h-[200px]" />,
});


export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user is logged in, show the dashboard view
  if (user) {
    return (
        <>
            <section id="calculators" className="py-12 md:py-16 pt-24 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold tracking-tight text-center mb-10">Calculators</h1>
                <div className="grid gap-8 lg:grid-cols-2 max-w-5xl mx-auto">
                  <CgpaCalculator />
                  <SubjectWiseAttendanceCalculator />
                </div>
              </div>
            </section>

            <section id="concepts" className="pt-20 pb-12 md:py-16 bg-card/50 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <div className="container mx-auto px-4">
                <ConceptMapFinder />
              </div>
            </section>
            
            <Features />
            <Stats />
            <PromotionCard />
            <Testimonials />

            <section id="contact" className="pt-20 pb-12 md:py-16 text-center">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold tracking-tight">Need Help?</h2>
                    <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                        If you're having trouble or have a question, please don't hesitate to contact us.
                    </p>
                    <Button asChild size="lg" className="mt-6">
                        <Link href="/contact">
                            Contact Support <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            </section>
        </>
    );
  }

  // If user is not logged in, show the public landing page content
  return (
    <>
        <Hero />
        
        <section id="calculators" className="pb-12 md:py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-10">Calculators</h2>
             <Card className="max-w-2xl mx-auto text-center">
                <CardHeader>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                        <Calculator className="h-6 w-6 text-primary"/>
                    </div>
                    <CardTitle>Unlock Powerful Tools</CardTitle>
                    <CardDescription>Log in to access the CGPA and Attendance calculators, save your data, and track your academic progress effortlessly.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/login"><LogIn className="mr-2 h-4 w-4"/> Log In to Use Calculators</Link>
                    </Button>
                </CardContent>
            </Card>
          </div>
        </section>
        
        <Features />
        <Stats />
        <PromotionCard />
        <Testimonials />

        <section id="contact" className="pt-20 pb-12 md:py-16 text-center">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold tracking-tight">Need Help?</h2>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    If you're having trouble or have a question, please don't hesitate to contact us.
                </p>
                <Button asChild size="lg" className="mt-6">
                    <Link href="/contact">
                        Contact Support <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
            </div>
        </section>
    </>
  );
}
