import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, Analytics } from 'firebase/analytics';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import appletFirebaseConfig from '../../firebase-applet-config.json';

const env = (import.meta as any).env || {};

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const defaultFirebaseConfig = {
  apiKey: 'AIzaSyDI4bwh-wNsuZIuM6xASf_fsSyQk0eKei4',
  authDomain: 'siz-football-academy-4bae6.firebaseapp.com',
  projectId: 'siz-football-academy-4bae6',
  storageBucket: 'siz-football-academy-4bae6.firebasestorage.app',
  messagingSenderId: '614658692954',
  appId: '1:614658692954:web:2667de449e7f17ba514563',
  measurementId: 'G-483ZWSNRT8',
};

export const firebaseConfig = {
  apiKey:
    env.VITE_FIREBASE_API_KEY ||
    defaultFirebaseConfig.apiKey ||
    appletFirebaseConfig.apiKey,
  authDomain:
    env.VITE_FIREBASE_AUTH_DOMAIN ||
    defaultFirebaseConfig.authDomain ||
    appletFirebaseConfig.authDomain,
  projectId:
    env.VITE_FIREBASE_PROJECT_ID ||
    defaultFirebaseConfig.projectId ||
    appletFirebaseConfig.projectId,
  storageBucket:
    env.VITE_FIREBASE_STORAGE_BUCKET ||
    defaultFirebaseConfig.storageBucket ||
    appletFirebaseConfig.storageBucket,
  messagingSenderId:
    env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    defaultFirebaseConfig.messagingSenderId ||
    appletFirebaseConfig.messagingSenderId,
  appId:
    env.VITE_FIREBASE_APP_ID ||
    defaultFirebaseConfig.appId ||
    appletFirebaseConfig.appId,
  measurementId:
    env.VITE_FIREBASE_MEASUREMENT_ID ||
    defaultFirebaseConfig.measurementId ||
    appletFirebaseConfig.measurementId ||
    '',
};

const resolvedDatabaseId =
  env.VITE_FIREBASE_FIRESTORE_DATABASE_ID ||
  (firebaseConfig.projectId === appletFirebaseConfig.projectId
    ? appletFirebaseConfig.firestoreDatabaseId
    : undefined);

// Initialize Firebase App singleton
export const app = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

// Initialize Firebase Analytics
export const analytics: Analytics | null = (() => {
  if (typeof window === 'undefined') return null;
  try {
    return getAnalytics(app);
  } catch (err) {
    console.warn('Firebase Analytics initialization skipped:', err);
    return null;
  }
})();

// Initialize Auth singleton
export const auth = getAuth(app);

// Initialize Firestore singleton (uses named DB if matching applet project or explicitly configured, else default DB)
export const db = resolvedDatabaseId
  ? getFirestore(app, resolvedDatabaseId)
  : getFirestore(app);

// Google Auth Provider (standard Firebase Authentication without Google Drive / Picker scopes)
const provider = new GoogleAuthProvider();

// In-memory token cache (strictly not stored in localStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Initialize Auth listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        if (onAuthSuccess) onAuthSuccess(user, null);
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in with Google (Popup)
export const googleSignIn = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    cachedAccessToken = credential?.accessToken || '';
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Get current in-memory access token
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

// Sign out
export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

// Test Firestore connection on app start
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore is running in offline mode or awaiting network connection.');
    }
  }
}

// Error handling as required by Firebase skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
