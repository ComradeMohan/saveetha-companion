
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from './ui/card';

interface Testimonial {
  id: string;
  name: string;
  message: string;
}

const defaultTestimonials: Testimonial[] = [
    {
        id: '1',
        name: 'Priya, CSE Student',
        message: 'The CGPA calculator is a lifesaver! Finally, an accurate and easy way to track my grades before the exams.'
    },
    {
        id: '2',
        name: 'Arjun, ECE Dept.',
        message: 'I use the attendance tracker every day. It\'s so much better than guessing. Highly recommend this site to all my friends.'
    },
    {
        id: '3',
        name: 'Sneha, 2nd Year',
        message: 'Found the concept map for my toughest subject here. Made studying for internals so much easier. Thank you!'
    },
    {
        id: '4',
        name: 'Rahul, Mech Engg.',
        message: 'This website has everything in one place. No more jumping between different apps for calculators and resources. 10/10!'
    },
    {
        id: '5',
        name: 'Ananya, 1st Year Student',
        message: 'As a fresher, this site made understanding the credit system and CGPA so simple. It\'s a must-have for all juniors.'
    },
    {
        id: '6',
        name: 'Vikram, Final Year',
        message: 'The placement prep section is underrated! The collection of common questions was super helpful for my interviews.'
    }
];


export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    // Set default testimonials on the client side to avoid hydration issues
    setTestimonials(defaultTestimonials);
  }, []);

  if (testimonials.length === 0) {
    return null; // Don't render the component if there are no testimonials
  }
  
  // Duplicate the array to create a seamless loop
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <div
      className="w-full overflow-hidden"
      style={{
        maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
      }}
    >
      <div className="flex animate-scroll-text gap-6 py-4">
        {duplicatedTestimonials.map((t, i) => (
          <Card key={`${t.id}-${i}`} className="min-w-[300px] sm:min-w-[350px] bg-card/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <blockquote className="text-muted-foreground italic mb-4">"{t.message}"</blockquote>
              <p className="font-semibold text-right">- {t.name}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
