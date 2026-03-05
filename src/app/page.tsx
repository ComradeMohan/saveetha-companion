'use client';

import Features from '@/components/features';
import Stats from '@/components/stats';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Testimonials } from '@/components/testimonials';
import Hero from '@/components/hero';
import { PromotionCard } from '@/components/promotion-card';
import ContactForm from '@/components/contact-form';

// Dynamic imports for core tools
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
  return (
    <>
      <Hero />

      <section id="calculators" className="py-12 md:py-16 bg-background animate-fade-in">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-10">Calculators</h2>
          <div className="grid gap-8 lg:grid-cols-2 max-w-5xl mx-auto">
            <CgpaCalculator />
            <SubjectWiseAttendanceCalculator />
          </div>
        </div>
      </section>

      <section id="concepts" className="py-20 bg-card/50 animate-fade-in">
        <div className="container mx-auto px-4">
          <ConceptMapFinder />
        </div>
      </section>

      <Features />
      <Stats />
      
      <section id="projects-preview" className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-6">Student Project Marketplace</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Explore and download academic projects, reports, and digital assets shared by your fellow students.
          </p>
          <Button asChild size="lg">
            <Link href="/projects">
              Browse Marketplace <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <PromotionCard />
      <Testimonials />

      <section id="contact" className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <ContactForm />
        </div>
      </section>
    </>
  );
}
