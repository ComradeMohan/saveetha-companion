
'use client';

import { useMemo } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
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
    const last7Days = Array.from({ length: 7 }, (_, i) => {
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
          const dayEntry = last7Days.find(
            day => day.date.getTime() === signupDate.getTime()
          );
          if (dayEntry) {
            dayEntry.total += 1;
          }
        }
      });
    }

    return last7Days;
  }, [userList, loading]);

  if (loading) {
    return <Skeleton className="h-[350px] w-full" />;
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
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
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
        />
        <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
