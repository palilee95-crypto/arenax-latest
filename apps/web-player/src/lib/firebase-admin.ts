import * as admin from 'firebase-admin';

const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

const hasFirebaseKeys = !!(
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
);

if (!admin.apps.length && hasFirebaseKeys) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        });
        console.log('[firebase-admin] Initialized successfully');
    } catch (error) {
        console.error('[firebase-admin] Initialization error:', error);
    }
} else if (!hasFirebaseKeys) {
    console.warn('[firebase-admin] Skipping initialization: Missing Firebase credentials (expected during build)');
}

export const messaging = admin.messaging();
