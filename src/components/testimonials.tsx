
'use client';

import { useEffect, useState } from 'react';
import { getTestimonials, type Testimonial } from '@/app/actions/get-testimonials';
import { Card, CardContent } from './ui/card';
import { Skeleton } from './ui/skeleton';

function TestimonialSkeleton() {
    return (
        <div className="flex gap-6 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
                 <Card key={i} className="min-w-[300px] sm:min-w-[350px]">
                    <CardContent className="p-6">
                        <Skeleton className="h-4 w-full mb-3" />
                        <Skeleton className="h-4 w-4/5 mb-6" />
                        <Skeleton className="h-5 w-1/3" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      setLoading(true);
      const data = await getTestimonials();
      setTestimonials(data);
      setLoading(false);
    };
    fetchTestimonials();
  }, []);

  if (loading) {
    return (
         <div className="w-full overflow-hidden">
            <TestimonialSkeleton />
        </div>
    );
  }

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
