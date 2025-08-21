
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { unstable_cache } from 'next/cache';
import type { Timestamp, DocumentData } from 'firebase-admin/firestore';

/**
 * @fileOverview Server actions for handling website analytics.
 * - trackVisit: Records a new page visit with a timestamp.
 * - getVisitAnalytics: Retrieves and processes visit data to provide key metrics and chart data.
 * - getVisitorCount: Retrieves the total visitor count from the 'counter' collection.
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
     if (!adminDb.collection) {
        console.warn("Analytics: Firestore Admin not initialized, skipping trackVisit.");
        return;
    }
    await adminDb.collection('page_visits').add({
      timestamp: adminDb.FieldValue.serverTimestamp(),
    });
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
    if (!adminDb.collection) {
      console.warn("Analytics: Firestore Admin not initialized, returning empty data.");
      return {
        totalVisits: 0,
        yesterdayVisits: 0,
        busiestDay: { date: 'N/A', count: 0 },
        chartData: [],
      };
    }

    const visitsCol = adminDb.collection('page_visits');
    const visitSnapshot = await visitsCol.get();
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

/**
 * Fetches the total visitor count from the 'counter' collection.
 * Caches the result for 1 hour.
 */
export const getVisitorCount = unstable_cache(
    async (): Promise<number> => {
        if (!adminDb.collection) {
            console.warn("Analytics: Firestore Admin not initialized, returning 0.");
            return 0;
        }

        try {
            const counterRef = adminDb.collection('counter').doc('visits');
            const counterDoc = await counterRef.get();

            if (counterDoc.exists) {
                return counterDoc.data()?.count || 0;
            }

            const visitsCol = adminDb.collection('page_visits');
            const visitSnapshot = await visitsCol.count().get();
            return visitSnapshot.data().count;
            
        } catch (error) {
            console.error("Error fetching visitor count:", error);
            return 0; // Return 0 on error
        }
    },
    ['visitor_count'],
    { revalidate: 3600 } // Revalidate every hour
);
