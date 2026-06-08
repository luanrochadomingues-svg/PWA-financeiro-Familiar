
"use client";

import { useAuth } from "@/lib/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LogIn, Loader2 } from "lucide-react";

export default function LoginPage() {
  const { user, signInWithGoogle, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.currentHouseholdId) {
        router.push("/pessoal");
      } else {
        router.push("/onboarding");
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-primary/20 bg-card/50 backdrop-blur-sm shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform">
            <span className="text-3xl font-headline font-bold text-primary-foreground">N</span>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-4xl font-headline text-primary">Nexo Financeiro</CardTitle>
            <CardDescription className="text-lg">Gestão inteligente para você, sua família e seu escritório.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Button 
            onClick={signInWithGoogle} 
            className="w-full h-12 text-lg font-semibold gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg"
          >
            <LogIn className="w-5 h-5" />
            Entrar com Google
          </Button>
          <p className="text-center text-sm text-muted-foreground mt-8">
            Ao entrar, você concorda com nossos termos de uso e política de privacidade.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
