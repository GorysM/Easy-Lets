import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC7K-IsSb_yMo4S4WFzlSsz5UDJsbvN-xo",
  authDomain: "easy-lets.firebaseapp.com",
  projectId: "easy-lets",
  storageBucket: "easy-lets.appspot.com",
  messagingSenderId: "351468875156",
  appId: "1:351468875156:web:ce514c0bdb1efb0d197381",
  measurementId: "G-BYTR65KSBP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app); // Initialize Firestore with the Firebase app

// Export the Firebase app and Firestore database instance
export { app, analytics, db };