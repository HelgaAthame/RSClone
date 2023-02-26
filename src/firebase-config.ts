// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyC5iFCKYQ9hq5J4es6mnov_PzXGFwJ8o4I",
  authDomain: "rsclone-97ff3.firebaseapp.com",
  projectId: "rsclone-97ff3",
  storageBucket: "rsclone-97ff3.appspot.com",
  messagingSenderId: "178694911715",
  appId: "1:178694911715:web:7b4172d67664448f8877d6",
  measurementId: "G-RF1XX29RQ3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
