import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export type UserRole = 'admin' | 'student' | 'teacher' | 'unverified';

interface UserData {
  role: UserRole;
  studentId?: string;
  email?: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  userData: UserData | null;
  loading: boolean;
  isAdmin: boolean;
  isStudent: boolean;
  isTeacher: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Fetch user document
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        let fetchedUserData: UserData;
        
        if (userDoc.exists()) {
          fetchedUserData = userDoc.data() as UserData;
        } else {
          // Check if admin bootstrap
          if (firebaseUser.email?.toLowerCase() === 'madrasabarvia@gmail.com') {
            fetchedUserData = { role: 'admin', email: firebaseUser.email };
          } else {
            fetchedUserData = { role: 'unverified', email: firebaseUser.email || undefined };
          }
          // Create the user document
          await setDoc(userDocRef, fetchedUserData);
        }
        
        setUserData(fetchedUserData);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    userData,
    loading,
    isAdmin: userData?.role === 'admin',
    isStudent: userData?.role === 'student',
    isTeacher: userData?.role === 'teacher'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
