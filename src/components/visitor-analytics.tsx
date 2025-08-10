
'use client';

import { useEffect, useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { getVisitAnalytics } from '@/app/actions/analytics';
import { TrendingUp, Users, Calendar } from 'lucide-react';

interface AnalyticsData {
  totalVisits: number;
  yesterdayVisits: number;
  busiestDay: {
    date: string;
    count: number;
  };
  chartData: { date: string; visits: number }[];
}

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
         <section className="py-20 md:py-28 bg-background/50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <Skeleton className="h-10 w-3/4 mx-auto" />
                    <Skeleton className="h-5 w-1/2 mx-auto mt-4" />
                </div>
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
        </section>
    )
}


export default function VisitorAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const analyticsData = await getVisitAnalytics();
        setData(analyticsData);
      } catch (error) {
        console.error("Failed to fetch analytics", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  if (!data) {
    return null;
  }

  return (
    <section className="py-20 md:py-28 bg-background/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">Website Analytics</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            A real-time look at our community's engagement and website traffic.
          </p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Visitor Trends (Last 30 Days)</CardTitle>
                <CardDescription>
                    This chart shows the daily visits to the website over the past month.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <ResponsiveContainer width="100%" height={350}>
                        <AreaChart data={data.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                            />
                            <YAxis
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                                allowDecimals={false}
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
                    <StatCard title="Total Visits" value={data.totalVisits} icon={Users} />
                    <StatCard title="Yesterday's Visits" value={data.yesterdayVisits} icon={Calendar} />
                    <StatCard title="Busiest Day" value={data.busiestDay.count} icon={TrendingUp} />
                </div>
            </CardContent>
        </Card>
      </div>
    </section>
  );
}
