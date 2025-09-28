
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Atomically increments the view count for a specific concept map.
 * This function is designed to be called when a user clicks a concept map link.
 * It uses Firestore's atomic increment operation to prevent race conditions.
 *
 * @param mapId The document ID of the concept map in the 'concept-maps' collection.
 */
export async function trackConceptMapView(mapId: string) {
  if (!mapId) {
    console.warn('trackConceptMapView: mapId is missing.');
    return { type: 'error', message: 'Concept Map ID is required.' };
  }

  try {
    const analyticsRef = adminDb.collection('concept-map-analytics').doc(mapId);
    
    // Atomically increment the 'viewCount' field.
    // If the document or field doesn't exist, it will be created and set to 1.
    await analyticsRef.set({
      viewCount: FieldValue.increment(1)
    }, { merge: true });

    return { type: 'success' };
  } catch (error) {
    console.error(`Error tracking view for mapId ${mapId}:`, error);
    return { type: 'error', message: 'An unexpected error occurred while tracking the view.' };
  }
}
