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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Defer initialization to after the first mount to ensure the 
    // initial client render matches the server render exactly.
    setMounted(true);
    const instances = initializeFirebase();
    setFirebase(instances);
  }, []);

  // During SSR and the first client-side render (hydration), mounted is false.
  // This ensures the HTML structure remains stable during hydration.
  if (!mounted || !firebase) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" suppressHydrationWarning>
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
