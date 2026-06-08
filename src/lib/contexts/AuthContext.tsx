"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  GoogleAuthProvider, 
  signInWithRedirect, 
  getRedirectResult, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from "firebase/auth";
import { doc, onSnapshot, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { useAuth as useFirebaseAuth, useFirestore } from "@/firebase";
import { User } from "@/lib/models";

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useFirebaseAuth();
  const db = useFirestore();
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Process redirect results (Google Login)
    getRedirectResult(auth).catch((err) => {
      console.error("Auth redirect error:", err);
      setError("Falha ao processar login com Google: " + err.message);
    });

    let unsubscribeProfile: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (fUser) => {
      console.log("Auth state changed:", fUser?.uid);
      setFirebaseUser(fUser);
      
      if (fUser) {
        setLoading(true);
        const userRef = doc(db, "users", fUser.uid);
        
        try {
          // Check if profile exists, if not, create it
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            console.log("Creating new user profile for:", fUser.uid);
            await setDoc(userRef, {
              uid: fUser.uid,
              displayName: fUser.displayName || "Usuário",
              email: fUser.email || "",
              currentHouseholdId: null,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }

          // Real-time listener for profile changes
          unsubscribeProfile = onSnapshot(userRef, (snapshot) => {
            if (snapshot.exists()) {
              console.log("Profile loaded:", snapshot.data());
              setUser(snapshot.data() as User);
            } else {
              console.warn("User profile document not found during snapshot");
              setUser(null);
            }
            setLoading(false);
          }, (err) => {
            console.error("Profile snapshot error:", err);
            setError("Erro ao carregar perfil: " + err.message);
            setLoading(false);
          });
        } catch (err: any) {
          console.error("Critical error in user profile sync:", err);
          setError("Erro crítico de banco de dados: " + err.message);
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, [auth, db]);

  const signInWithGoogle = async () => {
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithRedirect(auth, provider);
    } catch (err: any) {
      setError("Não foi possível iniciar o login: " + err.message);
    }
  };

  const logout = async () => {
    setLoading(true);
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, error, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
