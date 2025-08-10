import { initializeApp, getApp, getApps, type FirebaseOptions } from "firebase/app";
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

// Caching the analytics initialization promise to ensure it only runs once.
let analyticsPromise: Promise<Analytics | null> | null = null;

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
        // Analytics is a client-side only feature
        if (typeof window === 'undefined') {
            return null;
        }
        
        // Check for necessary configuration
        if (!firebaseConfig.measurementId || !firebaseConfig.apiKey) {
            console.error("FIREBASE: Analytics configuration is missing. Please set NEXT_PUBLIC_FIREBASE_API_KEY and NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID in your .env file.");
            // Log the values to help debug why they are missing
            console.log(`- Loaded API Key: ${process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'found' : 'missing'}`);
            console.log(`- Loaded Measurement ID: ${process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ? 'found' : 'missing'}`);
            return null;
        }

        try {
            // Dynamically import the analytics functions to ensure they only run on the client
            const { getAnalytics, isSupported } = await import("firebase/analytics");
            const supported = await isSupported();
            if (!supported) {
                console.warn("FIREBASE: Analytics is not supported in this browser.");
                return null;
            }

            const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
            console.log("FIREBASE: Analytics initialized successfully.");
            return getAnalytics(app);

        } catch (e) {
            console.error("FIREBASE: Failed to initialize Firebase Analytics:", e);
            return null;
        }
    })();
    
    return analyticsPromise;
}
