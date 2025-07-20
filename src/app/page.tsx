
'use client';

import Header from '@/components/header';
import Footer from '@/components/footer';
import Hero from '@/components/hero';
import CgpaCalculator from '@/components/cgpa-calculator';
import AttendanceCalculator from '@/components/attendance-calculator';
import ConceptMapFinder from '@/components/concept-map-finder';
import FacultyDirectory from '@/components/faculty-directory';
import ContactForm from '@/components/contact-form';
import { useAuth } from '@/hooks/use-auth';
import Features from '@/components/features';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {user ? (
          <>
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

            <section id="contact" className="py-12 md:py-16 bg-card/50 animate-fade-in" style={{ animationDelay: '0.7s' }}>
              <div className="container mx-auto px-4">
                <ContactForm />
              </div>
            </section>
          </>
        ) : (
          <>
            <Hero />
            <Features />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
