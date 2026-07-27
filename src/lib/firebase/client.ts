import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only if config is provided
const app = getApps().length === 0 && firebaseConfig.apiKey 
  ? initializeApp(firebaseConfig) 
  : getApps().length > 0 ? getApp() : null;

const messaging = app && typeof window !== "undefined" ? getMessaging(app) : null;

export const requestFCMToken = async () => {
  if (!messaging) return null;
  try {
    const currentToken = await getToken(messaging, { 
      // VAPID KEY pour les Web Push Credentials depuis Firebase Console
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY 
    });
    if (currentToken) {
      return currentToken;
    } else {
      console.log('No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (err) {
    console.log('An error occurred while retrieving token. ', err);
    return null;
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const onMessageListener = (callback: (payload: any) => void) => {
  if (!messaging) return () => {};
  return onMessage(messaging, callback);
};
