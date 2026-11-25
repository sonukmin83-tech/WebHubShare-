import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreError';
import { ADMIN_EMAIL, LIMITS, sanitizeText } from '../lib/validation';
import type { LanguageCode, UserAccount } from '../types/directory';

interface FirebaseContextValue {
  user: User | null;
  authReady: boolean;
  isAdmin: boolean;
  userAccount: UserAccount | null;
  language: LanguageCode;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setLanguage: (lang: LanguageCode) => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextValue | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [userAccount, setUserAccount] = useState<UserAccount | null>(null);
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('whs_lang');
    return saved === 'hi' ? 'hi' : 'en';
  });
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('whs_lang', language);
  }, [language]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);
      if (!firebaseUser) {
        setUserAccount(null);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!authReady || !user) return;

    const userPath = `users/${user.uid}`;
    const userRef = doc(db, 'users', user.uid);
    let cancelled = false;

    async function ensureUserDoc(currentUser: User) {
      try {
        const snap = await getDoc(userRef);
        if (!snap.exists() && !cancelled) {
          const email = sanitizeText(currentUser.email || `${currentUser.uid}@user.local`, LIMITS.EMAIL_MAX);
          const name = sanitizeText(currentUser.displayName || email.split('@')[0] || 'User', LIMITS.OWNER_NAME_MAX);
          await setDoc(userRef, {
            uid: currentUser.uid,
            name,
            email,
            language,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, userPath);
      }
    }

    void ensureUserDoc(user);

    const unsub = onSnapshot(
      userRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as UserAccount;
          setUserAccount(data);
          if (data.language === 'en' || data.language === 'hi') {
            setLanguageState(data.language);
          }
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, userPath);
      }
    );

    return () => {
      cancelled = true;
      unsub();
    };
  }, [authReady, user]);

  const signInWithGoogle = useCallback(async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Sign-in failed.');
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  const setLanguage = useCallback(
    async (nextLang: LanguageCode) => {
      setLanguageState(nextLang);
      if (!user) return;
      const userPath = `users/${user.uid}`;
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          language: nextLang,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, userPath);
      }
    },
    [user]
  );

  const isAdmin = Boolean(
    user && user.emailVerified && user.email && user.email.toLowerCase() === ADMIN_EMAIL
  );

  return (
    <FirebaseContext.Provider
      value={{
        user,
        authReady,
        isAdmin,
        userAccount,
        language,
        authError,
        signInWithGoogle,
        logout,
        setLanguage,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export function useFirebase() {
  const ctx = useContext(FirebaseContext);
  if (!ctx) throw new Error('useFirebase must be used inside FirebaseProvider');
  return ctx;
}
