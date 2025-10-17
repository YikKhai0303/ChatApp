// src/services/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAFGvQRQicCp8eXWANcHGPN9wPthslNSPc",
  authDomain: "chatapp-ace9b.firebaseapp.com",
  projectId: "chatapp-ace9b",
  storageBucket: "chatapp-ace9b.firebasestorage.app",
  messagingSenderId: "137229489365",
  appId: "1:137229489365:web:05a8dd49aa3b5f086dbe5c"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
