"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { createHousehold } from "@/lib/services/db";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Users, Home, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function OnboardingPage() {
  const { user, loading: authLoading } = useAuth();
  const [name, setName] = useState("Minha Família");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (!authLoading && user?.currentHouseholdId) {
      router.push("/pessoal");
    }
  }, [user, authLoading, router]);

  const handleCreate = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      await createHousehold(user.uid, name, user.email, user.displayName);
      toast({ title: "Bem-vindo!", description: "Sua casa financeira foi criada com sucesso." });
      router.push("/pessoal");
    } catch (e: any) {
      console.error("Erro ao criar household:", e);
      const errorMessage = e.message || "Erro desconhecido ao criar a casa financeira.";
      setError(errorMessage);
      toast({ 
        variant: "destructive", 
        title: "Erro de Permissão", 
        description: "Não foi possível criar a casa financeira. Verifique os detalhes abaixo." 
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-primary/20 shadow-xl">
        <CardHeader className="text-center">
          <Home className="w-12 h-12 mx-auto text-primary mb-4" />
          <CardTitle className="text-3xl font-headline">Primeiros Passos</CardTitle>
          <CardDescription className="text-lg">Vamos dar um nome para a sua gestão financeira familiar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Falha no Firestore</AlertTitle>
              <AlertDescription className="text-xs break-all">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground ml-1">Nome do Household</label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Ex: Família Silva" 
              className="h-12 text-lg focus:ring-primary"
            />
          </div>
          <Button 
            onClick={handleCreate} 
            disabled={loading || !name} 
            className="w-full h-12 text-lg font-semibold gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Users className="w-5 h-5" />}
            {loading ? "Criando..." : "Criar Casa Financeira"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
