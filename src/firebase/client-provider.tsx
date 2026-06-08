
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
    // Service Worker Registration
    if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => {
            console.log('SW registered: ', registration.scope);
          },
          (err) => {
            console.log('SW registration failed: ', err);
          }
        );
      });
    }

    setMounted(true);
    const instances = initializeFirebase();
    setFirebase(instances);
  }, []);

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
