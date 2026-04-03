import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { initializeFirestore, doc, getDoc, getDocs, setDoc, collection, addDoc, query, where, onSnapshot, orderBy, limit, serverTimestamp, getDocFromServer, updateDoc, deleteDoc, arrayUnion } from 'firebase/firestore';

// Import the Firebase configuration
// @ts-ignore
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);

// Use initializeFirestore with long polling to avoid connection issues in some environments
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId || '(default)');

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Validation function for Firestore connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. The client is offline.");
    }
  }
}
testConnection();

export { signInWithPopup, signOut, doc, getDoc, getDocs, setDoc, collection, addDoc, query, where, onSnapshot, orderBy, limit, serverTimestamp, updateDoc, deleteDoc, arrayUnion };
