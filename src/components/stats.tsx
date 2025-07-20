
'use client';

import { useEffect, useState, useRef } from 'react';
import { Users, BookOpen, GraduationCap, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const AnimatedCounter = ({ value, suffix = '' }: { value: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const target = value;

  useEffect(() => {
    if (value === 0) return;
    let start = 0;
    const duration = 2000;
    const frameDuration = 1000 / 60;
    const totalFrames = Math.round(duration / frameDuration);
    const increment = target / totalFrames;

    const counter = () => {
      start += increment;
      if (start < target) {
        setCount(Math.ceil(start));
        requestAnimationFrame(counter);
      } else {
        setCount(target);
      }
    };
    requestAnimationFrame(counter);
  }, [target, value]);

  return <span className="text-4xl font-bold text-primary">{Math.floor(count)}{suffix}</span>;
};

export default function Stats() {
    const [isVisible, setIsVisible] = useState(false);
    const [facultyCount, setFacultyCount] = useState(0);
    const [conceptMapCount, setConceptMapCount] = useState(0);
    const statsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const fetchCounts = async () => {
        try {
          const facultySnapshot = await getDocs(collection(db, 'faculty'));
          setFacultyCount(facultySnapshot.size);

          const conceptMapSnapshot = await getDocs(collection(db, 'concept-maps'));
          setConceptMapCount(conceptMapSnapshot.size);
        } catch (error) {
          console.error("Error fetching stats:", error);
        }
      };
      fetchCounts();
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        if (statsRef.current) {
            observer.observe(statsRef.current);
        }

        return () => {
            if (statsRef.current) {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                observer.unobserve(statsRef.current);
            }
        };
    }, []);

    const stats = [
      {
        icon: Users,
        value: 1500,
        label: 'Students Using',
        suffix: '+',
      },
      {
        icon: GraduationCap,
        value: facultyCount,
        label: 'Faculty Listed',
        suffix: '',
      },
      {
        icon: BrainCircuit,
        value: conceptMapCount,
        label: 'Concepts Mapped',
        suffix: '',
      },
       {
        icon: BookOpen,
        value: 30,
        label: 'Courses Covered',
        suffix: '+',
      },
    ];

  return (
    <section ref={statsRef} id="stats" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">Trusted by the Saveetha Community</h2>
        </div>
        <div className={cn("grid gap-8 sm:grid-cols-2 lg:grid-cols-4", isVisible ? 'animate-fade-in' : 'opacity-0')}>
          {stats.map((stat, index) => (
            <div 
                key={index} 
                className="text-center p-6 rounded-lg bg-card/60 shadow-lg transition-all duration-300 hover:shadow-primary/20 hover:scale-105"
                style={{ animationDelay: `${0.1 * (index + 1)}s`}}
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              {isVisible && <AnimatedCounter value={stat.value} suffix={stat.suffix} />}
              <p className="text-muted-foreground mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
