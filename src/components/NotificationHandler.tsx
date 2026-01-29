
'use client';

import { useEffect } from 'react';

/**
 * A client-side component that handles Firebase Cloud Messaging (FCM)
 * setup and token management once permission has been granted.
 * This component is now a no-op since FCM is removed.
 */
export default function NotificationHandler() {
  
  useEffect(() => {
    // FCM functionality has been removed.
  }, []);

  // This component renders nothing visible.
  return null;
}
