import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCVydtoyyUkyZxP5AcgzTxFGSBe9fqgPq8",
  authDomain: "hoow-ai.firebaseapp.com",
  projectId: "hoow-ai",
  storageBucket: "hoow-ai.firebasestorage.app",
  messagingSenderId: "694134936114",
  appId: "1:694134936114:web:76044bf301abd27377622b"
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
