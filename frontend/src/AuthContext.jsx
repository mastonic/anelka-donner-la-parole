import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  async function checkAdmin(firebaseUser) {
    if (!firebaseUser) return false;
    try {
      // Admin emails stored in config/admins → emails[]
      const snap = await getDoc(doc(db, 'config', 'admins'));
      if (snap.exists()) {
        const emails = snap.data().emails || [];
        return emails.includes(firebaseUser.email);
      }
    } catch (e) {
      console.warn('Admin check failed:', e);
    }
    return false;
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setIsAdmin(firebaseUser ? await checkAdmin(firebaseUser) : false);
      setLoading(false);
    });
    return unsub;
  }, []);

  async function loginWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider);
    const admin = await checkAdmin(result.user);
    setIsAdmin(admin);
    return { user: result.user, isAdmin: admin };
  }

  async function loginWithEmail(email, password) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const admin = await checkAdmin(result.user);
    setIsAdmin(admin);
    return { user: result.user, isAdmin: admin };
  }

  async function registerWithEmail(email, password) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const admin = await checkAdmin(result.user);
    setIsAdmin(admin);
    return { user: result.user, isAdmin: admin };
  }

  async function logout() {
    await signOut(auth);
    setUser(null);
    setIsAdmin(false);
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, loginWithGoogle, loginWithEmail, registerWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
