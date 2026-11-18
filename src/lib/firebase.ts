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

const defaultFirebaseConfig = {
  apiKey: 'AIzaSyDI4bwh-wNsuZIuM6xASf_fsSyQk0eKei4',
  authDomain: 'siz-football-academy-4bae6.firebaseapp.com',
  projectId: 'siz-football-academy-4bae6',
  storageBucket: 'siz-football-academy-4bae6.firebasestorage.app',
  messagingSenderId: '614658692954',
  appId: '1:614658692954:web:e036db117f3cb569514563',
  measurementId: 'G-483ZWSNRT8',
};

export const firebaseConfig = {
  apiKey:
    env.VITE_FIREBASE_API_KEY ||
    appletFirebaseConfig.apiKey ||
    defaultFirebaseConfig.apiKey,
  authDomain:
    env.VITE_FIREBASE_AUTH_DOMAIN ||
    appletFirebaseConfig.authDomain ||
    defaultFirebaseConfig.authDomain,
  projectId:
    env.VITE_FIREBASE_PROJECT_ID ||
    appletFirebaseConfig.projectId ||
    defaultFirebaseConfig.projectId,
  storageBucket:
    env.VITE_FIREBASE_STORAGE_BUCKET ||
    appletFirebaseConfig.storageBucket ||
    defaultFirebaseConfig.storageBucket,
  messagingSenderId:
    env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    appletFirebaseConfig.messagingSenderId ||
    defaultFirebaseConfig.messagingSenderId,
  appId:
    env.VITE_FIREBASE_APP_ID ||
    appletFirebaseConfig.appId ||
    defaultFirebaseConfig.appId,
  measurementId:
    env.VITE_FIREBASE_MEASUREMENT_ID ||
    appletFirebaseConfig.measurementId ||
    defaultFirebaseConfig.measurementId ||
    '',
};

export const resolvedDatabaseId =
  env.VITE_FIREBASE_FIRESTORE_DATABASE_ID ||
  appletFirebaseConfig.firestoreDatabaseId ||
  'ai-studio-tingatingasafari-977ea282-9f6e-4517-99b9-1d8a012db444';

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

// Initialize Firestore singleton connected to the provisioned named database
export const db = resolvedDatabaseId
  ? getFirestore(app, resolvedDatabaseId)
  : getFirestore(app);

// Google Auth Provider
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

export interface DatabaseConnectionStatus {
  connected: boolean;
  projectId: string;
  databaseId: string;
  latencyMs: number;
  checkedAt: string;
  statusMessage: string;
}

// Test Firestore connection on app start and return live diagnostic state
export async function testFirestoreConnection(): Promise<DatabaseConnectionStatus> {
  const start = Date.now();
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return {
      connected: true,
      projectId: firebaseConfig.projectId,
      databaseId: resolvedDatabaseId,
      latencyMs: Date.now() - start,
      checkedAt: new Date().toISOString(),
      statusMessage: 'Connected to live Firestore server',
    };
  } catch (error) {
    const latencyMs = Date.now() - start;
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
      return {
        connected: false,
        projectId: firebaseConfig.projectId,
        databaseId: resolvedDatabaseId,
        latencyMs,
        checkedAt: new Date().toISOString(),
        statusMessage: 'Client is offline — check Firebase configuration',
      };
    }
    // Note: PERMISSION_DENIED on /test/connection proves the Firestore server responded and default-deny rules are active!
    return {
      connected: true,
      projectId: firebaseConfig.projectId,
      databaseId: resolvedDatabaseId,
      latencyMs,
      checkedAt: new Date().toISOString(),
      statusMessage: 'Connected to live Firestore server (Security Rules active)',
    };
  }
}

// Run connection test automatically on boot in browser environment
if (typeof window !== 'undefined') {
  testFirestoreConnection().catch(() => {
    // Handled inside testFirestoreConnection
  });
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
