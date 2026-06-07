"use client";

import { useAuth } from "@/lib/contexts/AuthContext";
import { BottomNav } from "@/components/navigation/BottomNav";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function DashboardGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (!loading && user && !user.currentHouseholdId) {
      router.push("/onboarding");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
