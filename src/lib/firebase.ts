import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import autoFirebaseConfig from '../../firebase-applet-config.json';

// Support manual user overrides via environment variables
const customConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY || "AIzaSyB3ONuPp-wrhvzKNqjd3dGQmFRZsIkVkgI",
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN || "digital-factory-storefront.firebaseapp.com",
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID || "digital-factory-storefront",
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET || "digital-factory-storefront.firebasestorage.app",
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID || "483180258268",
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID || "1:483180258268:web:f3da09632cf4b2e25c2519",
  measurementId: (import.meta as any).env.VITE_FIREBASE_MEASUREMENT_ID || "G-J4BCVFRP96",
  firestoreDatabaseId: (import.meta as any).env.VITE_FIREBASE_DATABASE_ID || "(default)",
};

const isCustomEnabled = !!customConfig.apiKey;

const firebaseConfig = isCustomEnabled 
  ? {
      apiKey: customConfig.apiKey,
      authDomain: customConfig.authDomain,
      projectId: customConfig.projectId,
      storageBucket: customConfig.storageBucket,
      messagingSenderId: customConfig.messagingSenderId,
      appId: customConfig.appId,
      measurementId: customConfig.measurementId || "",
    }
  : autoFirebaseConfig;

const app = initializeApp(firebaseConfig);

// For custom projects, Firestore databaseId defaults to "(default)" unless specified
const databaseId = isCustomEnabled 
  ? (customConfig.firestoreDatabaseId || "(default)")
  : autoFirebaseConfig.firestoreDatabaseId;

export const db = getFirestore(app, databaseId);
export const auth = getAuth(app);

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
  }
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
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
