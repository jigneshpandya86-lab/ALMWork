import { initializeApp } from "firebase/app";
import { getFunctions, httpsCallable } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyDCEUGbTdKHhbON3hMaxm1LNTtYai4zi00",
  authDomain: "monuschool-ca080.firebaseapp.com",
  projectId: "monuschool-ca080",
  storageBucket: "monuschool-ca080.firebasestorage.app",
  messagingSenderId: "310286174065",
  appId: "1:310286174065:web:238d6d28c15955b34698d0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Functions with Mumbai region
export const functions = getFunctions(app, "asia-south1");

// Helper to call our Cloud Functions
export const api = {
  getStudents: httpsCallable(functions, 'getStudents'),
  createStudent: httpsCallable(functions, 'createStudent'),
  bulkCreateStudents: httpsCallable(functions, 'bulkCreateStudents'),
  updateStudent: httpsCallable(functions, 'updateStudent'),
  deleteStudent: httpsCallable(functions, 'deleteStudent'),
};
