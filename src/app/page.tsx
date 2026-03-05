'use client';

import Features from '@/components/features';
import Stats from '@/components/stats';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Testimonials } from '@/components/testimonials';
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
      <section id="calculators" className="pt-24 pb-12 md:pt-32 md:pb-16 bg-background animate-fade-in">
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
      
      <Testimonials />

      <section id="contact" className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <ContactForm />
        </div>
      </section>
    </>
  );
}
