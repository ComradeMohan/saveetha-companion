
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { unstable_cache } from 'next/cache';
import type { Timestamp, DocumentData } from 'firebase-admin/firestore';

/**
 * @fileOverview Server actions for handling website analytics.
 * - trackVisit: Increments the master visitor counter.
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
 * Increments a single counter document in the 'counter' collection.
 */
export async function trackVisit(): Promise<void> {
  try {
     if (!adminDb.collection) {
        console.warn("Analytics: Firestore Admin not initialized, skipping trackVisit.");
        return;
    }
    const counterRef = adminDb.collection('counter').doc('visits');
    await counterRef.update({
        count: adminDb.FieldValue.increment(1)
    });
  } catch (error: any) {
    // If the document doesn't exist, create it.
    if (error.code === 5) { // 5 = NOT_FOUND
         const counterRef = adminDb.collection('counter').doc('visits');
         await counterRef.set({ count: 1 });
    } else {
        console.error("Error tracking visit:", error);
    }
    // Fail silently to not impact user experience
  }
}


/**
 * Fetches and processes all visit data to generate analytics.
 * Caches the result for 1 hour to improve performance.
 * NOTE: This function currently uses placeholder data as individual visit tracking was removed.
 */
export const getVisitAnalytics = unstable_cache(
  async (): Promise<AnalyticsData> => {
    
    const totalVisits = await getVisitorCount();
    
    // Since we are no longer tracking individual visits, we cannot calculate
    // "yesterday's visits" or "busiest day" accurately from the database.
    // We will return static or placeholder data for these metrics.
    // A more advanced analytics solution (like Google Analytics) would be needed for this.

    const chartData: { date: string; visits: number }[] = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        chartData.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            // Placeholder data for chart
            visits: Math.floor(Math.random() * (500 - 50 + 1) + 50),
        });
    }

    return {
      totalVisits: totalVisits,
      yesterdayVisits: 689, // Placeholder
      busiestDay: { date: 'N/A', count: 0 }, // Placeholder
      chartData: chartData,
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

            // Fallback for safety, though it should not be needed if seeding is done.
            return 0;
            
        } catch (error) {
            console.error("Error fetching visitor count:", error);
            return 0; // Return 0 on error
        }
    },
    ['visitor_count'],
    { revalidate: 3600 } // Revalidate every hour
);
