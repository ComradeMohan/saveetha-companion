
'use client';

import { useMemo } from 'react';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import { Skeleton } from '../ui/skeleton';

interface User {
  createdAt?: string;
  [key: string]: any;
}

interface RecentSignupsProps {
  userList: User[];
  loading: boolean;
}

export default function RecentSignups({ userList, loading }: RecentSignupsProps) {
  const chartData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = startOfDay(subDays(new Date(), i));
      return {
        name: format(date, 'MMM d'),
        date: date,
        total: 0,
      };
    }).reverse();

    if (!loading && userList) {
      userList.forEach(user => {
        if (user.createdAt) {
          const signupDate = startOfDay(new Date(user.createdAt));
          const dayEntry = last30Days.find(
            day => day.date.getTime() === signupDate.getTime()
          );
          if (dayEntry) {
            dayEntry.total += 1;
          }
        }
      });
    }

    return last30Days;
  }, [userList, loading]);

  if (loading) {
    return <Skeleton className="h-[350px] w-full" />;
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
            </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
        <XAxis
          dataKey="name"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value, index) => {
            // Show tick for every 5th day to avoid clutter
            return index % 5 === 0 ? value : '';
          }}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
          allowDecimals={false}
          width={30}
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
            formatter={(value) => [`${value} new users`, 'Signups']}
        />
        <Area 
            type="monotone" 
            dataKey="total" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorTotal)"
            dot={{ r: 0 }}
            activeDot={{ r: 6, strokeWidth: 1, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--background))' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
