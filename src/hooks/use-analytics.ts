
'use client';

import { useCallback } from 'react';
import { getFirebaseAnalytics } from '@/lib/firebase';
import { logEvent } from 'firebase/analytics';

/**
 * A custom hook to provide a function for tracking custom analytics events.
 * It gracefully handles cases where Firebase Analytics is not initialized or available.
 * 
 * @example
 * const { track } = useAnalytics();
 * track('button_click', { button_name: 'primary_cta' });
 */
export function useAnalytics() {
  const track = useCallback(async (eventName: string, eventParams?: { [key: string]: any }) => {
    // getFirebaseAnalytics is a singleton, so it's safe to call it multiple times.
    const analytics = await getFirebaseAnalytics();
    
    if (analytics) {
      try {
        logEvent(analytics, eventName, eventParams);
      } catch (error) {
        // Log an error to the console for developers, but don't crash the app.
        console.error(`ANALYTICS: Error logging event '${eventName}':`, error);
      }
    }
  }, []);

  return { track };
}
