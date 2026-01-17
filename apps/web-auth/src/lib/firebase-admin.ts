import * as admin from 'firebase-admin';

const hasFirebaseKeys = !!(
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
);

if (!admin.apps.length && hasFirebaseKeys) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
        console.log('Firebase Admin initialized successfully');
    } catch (error) {
        console.error('Firebase Admin initialization error', error);
    }
} else if (!hasFirebaseKeys) {
    console.warn('Firebase Admin skipping initialization: Missing Firebase credentials (expected during build)');
}

// Lazy adminDb export to prevent build-time crashes
export const adminDb = new Proxy({} as admin.messaging.Messaging, {
    get(target, prop) {
        if (!hasFirebaseKeys) {
            return () => {
                console.warn(`[firebase-admin] adminDb.${String(prop)} called but Firebase keys are missing.`);
                return Promise.resolve({ success: false, error: 'Missing keys' });
            };
        }
        const service = admin.messaging();
        const value = (service as any)[prop];
        if (typeof value === 'function') {
            return value.bind(service);
        }
        return value;
    }
});
export default admin;
