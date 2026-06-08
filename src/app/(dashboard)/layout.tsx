"use client";

import { useAuth } from "@/lib/contexts/AuthContext";
import { BottomNav } from "@/components/navigation/BottomNav";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

function DashboardGuard({ children }: { children: React.ReactNode }) {
  const { user, firebaseUser, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!firebaseUser) {
        // Not authenticated at all
        router.push("/login");
      } else if (user && !user.currentHouseholdId && pathname !== "/onboarding") {
        // Authenticated but no household
        router.push("/onboarding");
      }
    }
  }, [user, firebaseUser, loading, router, pathname]);

  if (loading || (firebaseUser && !user)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Carregando dados da família...</p>
        </div>
      </div>
    );
  }

  // Se não houver firebaseUser, o useEffect redirecionará, evitamos flash de conteúdo
  if (!firebaseUser) return null;

  return (
    <div className="min-h-screen bg-background pb-20 overflow-x-hidden">
      <main className="max-w-md mx-auto px-4 pt-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardGuard>
      {children}
    </DashboardGuard>
  );
}
