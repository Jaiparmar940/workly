import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDB4h0rsimwMBgqT836xIhxXEE0MMMAnmE",
  authDomain: "workly-e411a.firebaseapp.com",
  projectId: "workly-e411a",
  storageBucket: "workly-e411a.appspot.com",
  messagingSenderId: "885804177924",
  appId: "1:885804177924:ios:1487bea6f313777a37b351"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;