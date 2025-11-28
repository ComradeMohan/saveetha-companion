
'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { Users, BookOpen, GraduationCap, BrainCircuit, TrendingUp, Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { updateAndGetAnalytics, getVisitAnalytics } from '@/app/actions/analytics';
import { format, endOfToday, eachDayOfInterval, subDays } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import { Testimonials } from './testimonials';


interface AnalyticsData {
  total: number;
  today: number;
  yesterday: number;
  busiestDay: {
    date: string;
    count: number;
  };
  daily: Record<string, number>;
}

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

function StatCard({ title, value, icon: Icon }: { title: string, value: string | number, icon: React.ElementType }) {
    return (
        <div className="flex items-center gap-4 rounded-lg bg-secondary/50 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
                <p className="text-sm text-muted-foreground">{title}</p>
                <p className="text-xl font-bold">{value.toLocaleString()}</p>
            </div>
        </div>
    )
}

function AnalyticsSkeleton() {
    return (
        <div className="container mx-auto px-4 mt-20">
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-2/3 mt-2" />
                </CardHeader>
                <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                            <Skeleton className="h-[350px] w-full" />
                    </div>
                    <div className="flex flex-col justify-center gap-4">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function Stats() {
    const [isVisible, setIsVisible] = useState(false);
    const [facultyCount, setFacultyCount] = useState(75);
    const [conceptMapCount, setConceptMapCount] = useState(20);
    const [analyticsData, setAnalyticsData] = useState<Partial<AnalyticsData>>({});
    const [analyticsLoading, setAnalyticsLoading] = useState(true);
    const statsRef = useRef<HTMLDivElement>(null);
    const isMobile = useIsMobile();

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

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

    useEffect(() => {
        const sessionKey = 'session_visited';
        const sessionVisited = sessionStorage.getItem(sessionKey);

        const fetchAnalytics = async () => {
            setAnalyticsLoading(true);
            try {
                let data;
                if (!sessionVisited) {
                    data = await updateAndGetAnalytics();
                    sessionStorage.setItem(sessionKey, 'true');
                } else {
                    data = await getVisitAnalytics();
                }
                setAnalyticsData(data);
            } catch (error) {
                console.error("Failed to fetch analytics", error);
                // Attempt to fetch non-incrementing data as a fallback
                try {
                    const fallbackData = await getVisitAnalytics();
                    setAnalyticsData(fallbackData);
                } catch (fallbackError) {
                    console.error("Failed to fetch fallback analytics", fallbackError);
                }
            } finally {
                setAnalyticsLoading(false);
            }
        };

        // Fetch analytics client-side to avoid server timeouts
        fetchAnalytics();
    }, []);

    const chartData = useMemo(() => {
        const daysToShow = isMobile ? 15 : 30;

        if (!analyticsData?.daily) {
             const end = endOfToday();
             const start = subDays(end, daysToShow - 1);
             const days = eachDayOfInterval({ start, end });
             return days.map(day => ({
                date: format(day, 'MMM d'),
                visits: 0
             }))
        }
        
        const end = endOfToday();
        const start = subDays(end, daysToShow - 1);
        const days = eachDayOfInterval({ start, end });
        
        return days.map(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            return {
                date: format(day, 'MMM d'),
                visits: analyticsData.daily?.[dateKey] || 0
            }
        })
    }, [analyticsData, isMobile]);

    const stats = [
      { icon: Users, value: 1500, label: 'Students Using', suffix: '+' },
      { icon: BrainCircuit, value: conceptMapCount, label: 'Concepts Mapped', suffix: '' },
      { icon: BookOpen, value: 30, label: 'Courses Covered', suffix: '+' },
    ];

  return (
    <section ref={statsRef} id="stats" className="py-20 md:py-28 bg-background/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">Trusted by the Saveetha Community</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            A real-time look at our community's engagement and website traffic.
          </p>
        </div>
        <div className={cn("grid gap-8 sm:grid-cols-2 lg:grid-cols-3", isVisible ? 'animate-fade-in' : 'opacity-0')}>
          {stats.map((stat, index) => (
            <div 
                key={index} 
                className="text-center p-6 rounded-lg bg-card shadow-lg transition-all duration-300 hover:shadow-primary/20 hover:scale-105"
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

        {analyticsLoading ? <AnalyticsSkeleton /> : (
             <div className="mt-20">
                <Card>
                    <CardHeader>
                        <CardTitle>Visitor Trends</CardTitle>
                        <CardDescription>
                            A chart showing daily website visits over the last {isMobile ? 15 : 30} days.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <ResponsiveContainer width="100%" height={350}>
                                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        interval={isMobile ? 3 : 6}
                                    />
                                    <YAxis
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value}`}
                                        allowDecimals={false}
                                        domain={[0, 'dataMax + 100']}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: "hsl(var(--background))",
                                            border: "1px solid hsl(var(--border))",
                                            borderRadius: "var(--radius)",
                                            color: "hsl(var(--foreground))"
                                        }}
                                        cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1.5 }}
                                        labelStyle={{ fontWeight: 'bold' }}
                                        formatter={(value, name) => [`${value} visits`, 'Date']}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="visits" 
                                        stroke="hsl(var(--primary))" 
                                        strokeWidth={2}
                                        fillOpacity={1} 
                                        fill="url(#colorVisits)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-col justify-center gap-4">
                            <StatCard title="Total Visits" value={analyticsData.total || 0} icon={Users} />
                            <StatCard title="Today's Visits" value={analyticsData.today || 0} icon={Clock} />
                            <StatCard title="Yesterday's Visits" value={analyticsData.yesterday || 0} icon={Calendar} />
                             {analyticsData.busiestDay?.date && (
                                <StatCard 
                                    title="Busiest Day" 
                                    value={`${analyticsData.busiestDay.count} (on ${format(new Date(analyticsData.busiestDay.date), 'MMM d')})`} 
                                    icon={TrendingUp} 
                                />
                            )}
                        </div>
                    </CardContent>
                </Card>
             </div>
        )}
        
        <div className="mt-12">
            <Testimonials />
        </div>
      </div>
    </section>
  );
}
