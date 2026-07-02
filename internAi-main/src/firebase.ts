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
