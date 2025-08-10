

'use client';

import { initializeApp, getApp, getApps, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import type { Analytics } from "firebase/analytics";

const firebaseConfig: FirebaseOptions = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Caching initialization promises to ensure they only run once.
let appPromise: Promise<FirebaseApp | null> | null = null;
let analyticsPromise: Promise<Analytics | null> | null = null;

const checkFirebaseConfig = (): boolean => {
    if (!firebaseConfig.measurementId || !firebaseConfig.apiKey) {
        console.warn("FIREBASE: Analytics/Performance configuration is missing. Ensure NEXT_PUBLIC_FIREBASE_API_KEY and NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID are in .env and the server is RESTARTED.");
        return false;
    }
    return true;
}

/**
 * Initializes and gets the Firebase App instance. This is a prerequisite for other services.
 * @returns A promise that resolves to the FirebaseApp instance or null if not configured.
 */
const getFirebaseApp = (): Promise<FirebaseApp | null> => {
    if (appPromise) {
        return appPromise;
    }
    appPromise = (async () => {
        if (typeof window === 'undefined' || !checkFirebaseConfig()) {
            return null;
        }
        return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    })();
    return appPromise;
}


/**
 * Gets the Firebase Analytics instance, but only if it's supported and configured.
 * This function is safe to call on both server and client. It will only initialize on the client.
 * @returns A promise that resolves to the Analytics instance or null.
 */
export const getFirebaseAnalytics = (): Promise<Analytics | null> => {
    if (analyticsPromise) {
        return analyticsPromise;
    }

    analyticsPromise = (async () => {
        const app = await getFirebaseApp();
        if (!app) {
            return null;
        }

        try {
            const { getAnalytics, isSupported } = await import("firebase/analytics");
            const supported = await isSupported();
            if (!supported) {
                console.warn("FIREBASE: Analytics is not supported in this browser.");
                return null;
            }
            return getAnalytics(app);
        } catch (e) {
            console.error("FIREBASE: Failed to initialize Firebase Analytics:", e);
            return null;
        }
    })();
    
    return analyticsPromise;
}
