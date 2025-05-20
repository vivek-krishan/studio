
"use client";
import type { User } from 'firebase/auth';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut, updateProfile as firebaseUpdateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { ReactNode } from 'react';
import { createContext, useEffect, useState } from 'react';
import { auth as firebaseAuthService, db as firebaseDbService } from '@/lib/firebase'; // Renamed imports
import type { UserProfile, UserRole } from '@/types';

export interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, pass: string, displayName: string, role: UserRole) => Promise<void>;
  signIn: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseAuthService) {
      console.error("Firebase Auth service is not available. Authentication will not work. Please check Firebase configuration.");
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(firebaseAuthService, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        if (!firebaseDbService) {
          console.error("Firebase Firestore service is not available. Cannot fetch user profile.");
          setUserProfile(null);
          setLoading(false);
          return;
        }
        const userDocRef = doc(firebaseDbService, 'users', firebaseUser.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserProfile(userDocSnap.data() as UserProfile);
          } else {
            setUserProfile(null); 
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUserProfile(null);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, pass: string, displayName: string, role: UserRole) => {
    if (!firebaseAuthService || !firebaseDbService) {
      throw new Error("Firebase services not available. Signup failed. Please check Firebase configuration.");
    }
    const userCredential = await createUserWithEmailAndPassword(firebaseAuthService, email, pass);
    await firebaseUpdateProfile(userCredential.user, { displayName });
    
    const newUserProfile: UserProfile = {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: displayName,
      role: role,
    };
    await setDoc(doc(firebaseDbService, 'users', userCredential.user.uid), newUserProfile);
    // onAuthStateChanged will update user and userProfile state, no need to explicitly set here
    // to avoid potential race conditions or duplicate state updates.
  };

  const signIn = async (email: string, pass:string) => {
    if (!firebaseAuthService) {
      throw new Error("Firebase Auth service not available. Sign-in failed. Please check Firebase configuration.");
    }
    await signInWithEmailAndPassword(firebaseAuthService, email, pass);
    // onAuthStateChanged will handle setting user and userProfile
  };

  const signOut = async () => {
    if (!firebaseAuthService) {
      console.error("Firebase Auth service not available. Sign-out might not complete fully in Firebase.");
      // Still attempt to clear local state
      setUser(null);
      setUserProfile(null);
      return;
    }
    await firebaseSignOut(firebaseAuthService);
    setUser(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
