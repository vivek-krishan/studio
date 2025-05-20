
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { type Auth, getAuth } from 'firebase/auth';
import { type Firestore, getFirestore } from 'firebase/firestore';
import { type FirebaseStorage, getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Client-side check for missing crucial configuration. This runs when the module is loaded.
if (typeof window !== 'undefined') {
  if (!firebaseConfig.apiKey) {
    console.warn(
      "Firebase API Key is missing. Please ensure NEXT_PUBLIC_FIREBASE_API_KEY is correctly set in your .env file and that your Next.js server has been restarted after any changes to .env."
    );
  }
  if (!firebaseConfig.projectId) {
    console.warn(
      "Firebase Project ID is missing. Please ensure NEXT_PUBLIC_FIREBASE_PROJECT_ID is correctly set."
    );
  }
  if (!firebaseConfig.authDomain) {
    console.warn("Firebase Auth Domain is missing. Please ensure NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is correctly set.");
  }
  // Add more checks as needed, e.g., for appId
  if (!firebaseConfig.appId) {
    console.warn("Firebase App ID is missing. Please ensure NEXT_PUBLIC_FIREBASE_APP_ID is correctly set.");
  }
}

let app: FirebaseApp | undefined = undefined;
let authInstance: Auth | undefined = undefined;
let dbInstance: Firestore | undefined = undefined;
let storageInstance: FirebaseStorage | undefined = undefined;

if (getApps().length) {
  app = getApp();
  try {
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);
    storageInstance = getStorage(app);
  } catch (error) {
      console.error("Error getting Firebase services from existing app:", error);
  }
} else if (firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId) {
  // Only attempt to initialize if essential config values are present
  try {
    app = initializeApp(firebaseConfig);
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);
    storageInstance = getStorage(app);
  } catch (error) {
    console.error("CRITICAL: Firebase initialization failed:", error);
    // app, authInstance, dbInstance, storageInstance remain undefined
  }
} else {
  console.error(
    "CRITICAL: Firebase initialization skipped due to missing essential configuration (apiKey, projectId, or appId). Firebase features will not work."
  );
}

// Export potentially undefined services. Consuming code must check for their existence.
export { app, authInstance as auth, dbInstance as db, storageInstance as storage };
