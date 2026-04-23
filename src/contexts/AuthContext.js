import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, COLLECTIONS, ROLES } from '../config/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [role, setRole]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadUserProfile(firebaseUser) {
    try {
      const snap = await getDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid));
      if (snap.exists()) {
        const data = snap.data();
        setRole(data.role ?? ROLES.STUDENT);
        setProfile({ uid: firebaseUser.uid, ...data });
      } else {
        setRole(ROLES.STUDENT);
        setProfile({ uid: firebaseUser.uid, email: firebaseUser.email, displayName: firebaseUser.displayName });
      }
    } catch {
      setRole(ROLES.STUDENT);
    }
    setUser(firebaseUser);
  }

  async function refreshUser() {
    if (auth.currentUser) await loadUserProfile(auth.currentUser);
  }

  function forceRole(newRole) {
    setRole(newRole);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await loadUserProfile(firebaseUser);
      } else {
        setUser(null);
        setRole(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, profile, loading, refreshUser, forceRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
