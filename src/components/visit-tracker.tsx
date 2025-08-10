
'use client';

import { useEffect } from 'react';
import { trackVisit } from '@/app/actions/analytics';

export default function VisitTracker() {
  useEffect(() => {
    // We can call the server action directly.
    // No need for complex client-side logic, as we want to count every page load.
    trackVisit();
  }, []);

  return null; // This component does not render anything
}
