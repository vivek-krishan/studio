
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

// Client-side check for missing crucial configuration
if (typeof window !== 'undefined') { // Only run in browser
  if (!firebaseConfig.apiKey) {
    console.warn(
      "Firebase API Key is missing. Please ensure NEXT_PUBLIC_FIREBASE_API_KEY is correctly set in your .env file and that your Next.js server has been restarted after any changes to .env."
    );
  }
  // You could add more checks for other keys like projectId if needed:
  // if (!firebaseConfig.projectId) {
  //   console.warn(
  //     "Firebase Project ID is missing. Please check your NEXT_PUBLIC_FIREBASE_PROJECT_ID environment variable."
  //   );
  // }
}

let app: FirebaseApp;
if (!getApps().length) {
  // Only initialize if the API key is present, to avoid further errors if it's missing.
  // The warning above should guide the user.
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
  } else {
    // If apiKey is missing, we can't initialize Firebase.
    // We'll throw an error here to make it very clear in the console.
    // Alternatively, app could remain undefined, and subsequent getAuth/getFirestore calls would fail.
    console.error("CRITICAL: Firebase initialization failed due to missing API key. App will not function correctly.");
    // To prevent the app from crashing entirely here, we might assign a dummy or throw later.
    // For now, let's let it proceed and subsequent Firebase calls will fail, which is where the original error came from.
    // This means `getAuth(app)` will likely fail if app is not initialized.
    // A more robust solution for a broken config might be to provide a dummy app or gate Firebase features.
    // However, the core issue is the missing env var.
    app = {} as FirebaseApp; // Assign a type-compatible empty object to prevent immediate crash, errors will occur on usage.
  }
} else {
  app = getApp();
}

// These will throw errors if 'app' is not a properly initialized FirebaseApp instance
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

export { app, auth, db, storage };
