
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { collection, getDocs, Timestamp, addDoc, FieldValue } from 'firebase-admin/firestore';
import { unstable_cache } from 'next/cache';

/**
 * @fileOverview Server actions for handling website analytics.
 * - trackVisit: Records a new page visit with a timestamp.
 * - getVisitAnalytics: Retrieves and processes visit data to provide key metrics and chart data.
 */

interface Visit {
  timestamp: Timestamp;
}

interface AnalyticsData {
  totalVisits: number;
  yesterdayVisits: number;
  busiestDay: {
    date: string;
    count: number;
  };
  chartData: { date: string; visits: number }[];
}

/**
 * Records a single page visit in the 'page_visits' collection.
 */
export async function trackVisit(): Promise<void> {
  try {
    if (adminDb) {
      await addDoc(collection(adminDb, 'page_visits'), {
        timestamp: FieldValue.serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("Error tracking visit:", error);
    // Fail silently to not impact user experience
  }
}


/**
 * Fetches and processes all visit data to generate analytics.
 * Caches the result for 1 hour to improve performance.
 */
export const getVisitAnalytics = unstable_cache(
  async (): Promise<AnalyticsData> => {
    if (!adminDb) {
      throw new Error('Firestore is not initialized.');
    }

    const visitsCol = collection(adminDb, 'page_visits');
    const visitSnapshot = await getDocs(visitsCol);
    const visits: Visit[] = visitSnapshot.docs.map(doc => doc.data() as Visit).filter(v => v.timestamp);


    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    let yesterdayVisits = 0;
    const dailyCounts: { [key: string]: number } = {};

    visits.forEach(visit => {
      const visitDate = visit.timestamp.toDate();
      const visitDateStr = visitDate.toISOString().split('T')[0];

      if (visitDate >= yesterday && visitDate < today) {
        yesterdayVisits++;
      }

      dailyCounts[visitDateStr] = (dailyCounts[visitDateStr] || 0) + 1;
    });

    // Generate data for the last 30 days for the chart
    const chartData: { date: string; visits: number }[] = [];
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        chartData.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            visits: dailyCounts[dateStr] || 0,
        });
    }
    
    let busiestDay = { date: 'N/A', count: 0 };
    Object.entries(dailyCounts).forEach(([date, count]) => {
        if (count > busiestDay.count) {
            busiestDay = { date: new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), count };
        }
    });

    return {
      totalVisits: visits.length,
      yesterdayVisits,
      busiestDay,
      chartData,
    };
  },
  ['visit_analytics'],
  { revalidate: 3600 } // Revalidate every hour
);
