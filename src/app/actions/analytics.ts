
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { startOfToday, isSameDay } from 'date-fns';

/**
 * @fileOverview Server actions for handling website analytics.
 * - getVisitAnalytics: Retrieves and processes visit data to provide key metrics and chart data.
 * - updateAndGetAnalytics: Atomically increments the visitor count and returns the new value.
 */

interface AnalyticsData {
  total: number;
  today: number;
  yesterday: number;
  busiestDay: {
    date: string;
    count: number;
  };
  daily: Record<string, number>;
  lastUpdate: string;
}

/**
 * Fetches and processes all visit data to generate analytics.
 * This function does NOT increment the count. It is intended for display purposes when an increment is not needed.
 */
export const getVisitAnalytics = async (): Promise<Partial<AnalyticsData>> => {
    if (!adminDb.collection) {
      console.warn("Analytics: Firestore Admin not initialized, returning empty data.");
      return {};
    }

    try {
      const analyticsRef = adminDb.collection('counter').doc('visits');
      const doc = await analyticsRef.get();
      if (!doc.exists) {
        return { total: 0, today: 0, yesterday: 0, busiestDay: { date: '', count: 0 } };
      }
      return doc.data() as Partial<AnalyticsData>;
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      return {};
    }
};

/**
 * Fetches the total visitor count from the 'counter' collection for display purposes.
 * Does not increment the count.
 */
export const getVisitorCount = async (): Promise<number> => {
    if (!adminDb.collection) {
        console.warn("Analytics: Firestore Admin not initialized, returning 0.");
        return 0;
    }

    try {
        const counterRef = adminDb.collection('counter').doc('visits');
        const counterDoc = await counterRef.get();

        if (counterDoc.exists) {
            return counterDoc.data()?.total || 0;
        }
        return 0;
        
    } catch (error) {
        console.error("Error fetching visitor count:", error);
        return 0; 
    }
};


/**
 * Atomically increments the visitor count and updates daily analytics in Firestore.
 * Uses a transaction to prevent race conditions.
 */
export async function updateAndGetAnalytics(): Promise<Partial<AnalyticsData>> {
  if (!adminDb.runTransaction) {
    console.warn("Analytics: Firestore Admin not initialized, cannot increment count.");
    return getVisitAnalytics();
  }

  const analyticsRef = adminDb.collection('counter').doc('visits');

  try {
    const updatedData = await adminDb.runTransaction(async (transaction) => {
      const doc = await transaction.get(analyticsRef);
      const today = startOfToday();
      const todayKey = today.toISOString().split('T')[0]; // Format as YYYY-MM-DD

      if (!doc.exists) {
        const initialData: AnalyticsData = {
          total: 1,
          today: 1,
          yesterday: 0,
          daily: { [todayKey]: 1 },
          busiestDay: { date: todayKey, count: 1 },
          lastUpdate: today.toISOString(),
        };
        transaction.set(analyticsRef, initialData);
        return initialData;
      }

      const data = doc.data() as AnalyticsData;
      const lastUpdateDate = new Date(data.lastUpdate);

      // Increment total count
      data.total = (data.total || 0) + 1;

      // Update daily count
      if (isSameDay(today, lastUpdateDate)) {
        data.today = (data.today || 0) + 1;
      } else {
        // Day has rolled over
        data.yesterday = data.today || 0; // Yesterday's count is the last known 'today' count
        data.today = 1; // Reset today's count
      }
      
      data.daily = data.daily || {};
      data.daily[todayKey] = (data.daily[todayKey] || 0) + 1;

      // Update busiest day
      if (!data.busiestDay || data.daily[todayKey] > data.busiestDay.count) {
        data.busiestDay = { date: todayKey, count: data.daily[todayKey] };
      }
      
      data.lastUpdate = today.toISOString();

      transaction.update(analyticsRef, { ...data });
      return data;
    });

    return updatedData;

  } catch (error) {
    console.error("Transaction to update analytics failed:", error);
    return getVisitAnalytics();
  }
}
