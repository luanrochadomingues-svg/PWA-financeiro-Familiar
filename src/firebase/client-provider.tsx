'use client';

import React, { useState, useEffect } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [firebase, setFirebase] = useState<{
    app: any;
    auth: any;
    db: any;
  } | null>(null);

  useEffect(() => {
    // Only initialize on the client after mount to avoid hydration mismatches
    // and "server/client branch" errors.
    const instances = initializeFirebase();
    setFirebase(instances);
  }, []);

  if (!firebase) {
    // Return a consistent placeholder during SSR and initial client hydration
    // to prevent mismatching content that relies on Firebase state.
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <FirebaseProvider app={firebase.app} auth={firebase.auth} db={firebase.db}>
      {children}
    </FirebaseProvider>
  );
}
