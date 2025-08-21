
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { unstable_cache } from 'next/cache';

/**
 * @fileOverview Server actions for handling website analytics.
 * - getVisitAnalytics: Retrieves and processes visit data to provide key metrics and chart data.
 * - incrementAndGetVisitorCount: Atomically increments the visitor count and returns the new value.
 */

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
 * Fetches and processes all visit data to generate analytics.
 * Caches the result for 1 hour to improve performance.
 * NOTE: This function currently uses placeholder data.
 */
export const getVisitAnalytics = unstable_cache(
  async (): Promise<AnalyticsData> => {
    
    const totalVisits = await getVisitorCount();
    
    const chartData: { date: string; visits: number }[] = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        chartData.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            visits: Math.floor(Math.random() * (500 - 50 + 1) + 50),
        });
    }

    return {
      totalVisits: totalVisits,
      yesterdayVisits: 689, 
      busiestDay: { date: 'N/A', count: 0 },
      chartData: chartData,
    };
  },
  ['visit_analytics'],
  { revalidate: 3600 }
);

/**
 * Fetches the total visitor count from the 'counter' collection for display purposes.
 * Does not increment the count.
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
            return 0;
            
        } catch (error) {
            console.error("Error fetching visitor count:", error);
            return 0; 
        }
    },
    ['visitor_count'],
    { revalidate: 3600 }
);


/**
 * Atomically increments the visitor count in Firestore and returns the new count.
 * Uses a transaction to prevent race conditions.
 */
export async function incrementAndGetVisitorCount(): Promise<number> {
  if (!adminDb.runTransaction) {
    console.warn("Analytics: Firestore Admin not initialized, cannot increment count.");
    // Attempt to just fetch the count as a fallback
    return getVisitorCount();
  }

  const counterRef = adminDb.collection('counter').doc('visits');

  try {
    const newCount = await adminDb.runTransaction(async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      
      let currentCount = 0;
      if (counterDoc.exists) {
        currentCount = counterDoc.data()?.count || 0;
      }
      
      const newCount = currentCount + 1;
      
      transaction.set(counterRef, { count: newCount }, { merge: true });
      
      return newCount;
    });
    return newCount;
  } catch (error) {
    console.error("Transaction to increment visitor count failed:", error);
    // If transaction fails, return the last known good count
    return getVisitorCount();
  }
}
