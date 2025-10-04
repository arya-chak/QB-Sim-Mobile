// config/firebase.js
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDT_a7NoFLcVgjzU-J4F6avXYjABkOMV2E",
  authDomain: "presnap-prep.firebaseapp.com",
  projectId: "presnap-prep",
  storageBucket: "presnap-prep.firebasestorage.app",
  messagingSenderId: "376630854341",
  appId: "1:376630854341:web:38ec9589b70467259866ac",
  measurementId: "G-PKDRG0L41G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
export const db = getFirestore(app);

export default app;