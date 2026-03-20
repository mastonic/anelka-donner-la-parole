import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAcAL9wvq5RD16zj560eM37mQzzGoej9rY",
  authDomain: "dolunaleka.firebaseapp.com",
  projectId: "dolunaleka",
  storageBucket: "dolunaleka.firebasestorage.app",
  messagingSenderId: "649039088799",
  appId: "1:649039088799:web:4ec90582c2c7ba301be6aa"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
