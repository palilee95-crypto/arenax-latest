import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if required config is present
const isConfigValid = !!firebaseConfig.projectId && !!firebaseConfig.apiKey;

// Initialize Firebase only if config is valid
let app: any;
try {
    if (isConfigValid) {
        app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    } else {
        console.warn("[firebase-client] Firebase config is missing required fields (projectId or apiKey). Client-side Firebase services (like Messaging) will be disabled.");
    }
} catch (error) {
    console.error("[firebase-client] Failed to initialize Firebase:", error);
}

let messaging: Messaging | undefined;

if (typeof window !== "undefined" && app) {
    try {
        messaging = getMessaging(app);
    } catch (error) {
        console.error("[firebase-client] Failed to initialize Messaging:", error);
    }
}

export { app, messaging };

export const requestForToken = async () => {
    if (!messaging) return null;

    try {
        const currentToken = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });
        if (currentToken) {
            console.log("current token for client: ", currentToken);
            return currentToken;
        } else {
            console.log("No registration token available. Request permission to generate one.");
            return null;
        }
    } catch (err) {
        console.log("An error occurred while retrieving token. ", err);
        return null;
    }
};

export const onMessageListener = () =>
    new Promise((resolve) => {
        if (!messaging) return;
        onMessage(messaging, (payload) => {
            console.log("payload", payload);
            resolve(payload);
        });
    });
