
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { getFirebaseAnalytics } from '@/lib/firebase';
import { logEvent } from 'firebase/analytics';

/**
 * A component that tracks page views for Firebase Analytics.
 * It uses Next.js navigation events to log a 'page_view' whenever the route changes.
 */
export function AnalyticsTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Track Page Views for Analytics
    useEffect(() => {
        const logPageView = async () => {
            const analytics = await getFirebaseAnalytics();
            
            if (analytics) {
                try {
                    const search = searchParams.toString();
                    const url = `${pathname}${search ? `?${search}` : ''}`;
                    
                    const eventParams = {
                        page_location: window.location.href,
                        page_path: url,
                        page_title: document.title,
                    };

                    logEvent(analytics, 'page_view', eventParams);

                } catch (error) {
                    console.error("ANALYTICS_TRACKER: Error logging page_view event:", error);
                }
            }
        };
        
        logPageView();

    }, [pathname, searchParams]);

    // This component does not render anything to the DOM.
    return null;
}
