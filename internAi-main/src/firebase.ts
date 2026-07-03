/// <reference types="vite/client" />
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCVydtoyyUkyZxP5AcgzTxFGSBe9fqgPq8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "hoow-ai.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "hoow-ai",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "hoow-ai.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "694134936114",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:694134936114:web:76044bf301abd27377622b"
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
