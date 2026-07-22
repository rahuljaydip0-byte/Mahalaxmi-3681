import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { Firestore, initializeFirestore, setLogLevel } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Read config from Vite environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId && 
  firebaseConfig.apiKey !== "" &&
  firebaseConfig.projectId !== "" &&
  firebaseConfig.apiKey !== "MY_FIREBASE_API_KEY" &&
  firebaseConfig.projectId !== "MY_FIREBASE_PROJECT_ID" &&
  !firebaseConfig.apiKey.includes("YOUR_") &&
  !firebaseConfig.projectId.includes("YOUR_")
);

// Silence verbose Firestore logs for sandbox mode
try {
  setLogLevel('silent');
} catch (e) {
  // Ignore
}

try {
  if (isFirebaseConfigured) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    // Use long-polling for iframe/sandbox compatibility and avoid websocket connection timeouts
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true
    });
    storage = getStorage(app);
  }
} catch (error) {
  console.warn("Firebase initialization skipped or failed, falling back to local persistent store:", error);
}

export { app, auth, db, storage };

