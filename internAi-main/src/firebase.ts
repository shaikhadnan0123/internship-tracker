/// <reference types="vite/client" />
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = (typeof window !== "undefined" && (window as any).FIREBASE_CONFIG) || {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBQWa84xtBpiXHfIf8cgtjQwanF5gJjfEQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "vivid-grove-479413-f8.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "vivid-grove-479413-f8",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "vivid-grove-479413-f8.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "278616152276",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:278616152276:web:ce4225b78587d394934341"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth & Firestore services
export const auth = getAuth(app);
export const db = getFirestore(app);

// secureFetch: Automatically attaches Firebase Auth ID Token to outgoing requests
export async function secureFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  try {
    const user = auth.currentUser;
    if (user) {
      const idToken = await user.getIdToken();
      headers.set('Authorization', `Bearer ${idToken}`);
    }
  } catch (err) {
    console.error("Failed to append Firebase Auth ID token to request headers:", err);
  }
  return fetch(url, { ...options, headers });
}
