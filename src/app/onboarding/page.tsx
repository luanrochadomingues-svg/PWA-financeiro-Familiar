"use client";

import { useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { createHousehold } from "@/lib/services/db";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Users, Home } from "lucide-react";

export default function OnboardingPage() {
  const { user } = useAuth();
  const [name, setName] = useState("Minha Família");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await createHousehold(user.uid, name, user.email, user.displayName);
      toast({ title: "Bem-vindo!", description: "Sua casa financeira foi criada com sucesso." });
      router.push("/pessoal");
    } catch (e) {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível criar a casa financeira." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-primary/20 shadow-xl">
        <CardHeader className="text-center">
          <Home className="w-12 h-12 mx-auto text-primary mb-4" />
          <CardTitle className="text-3xl font-headline">Primeiros Passos</CardTitle>
          <CardDescription className="text-lg">Vamos dar um nome para a sua gestão financeira familiar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
            {loading ? "Criando..." : "Criar Casa Financeira"}
            <Users className="w-5 h-5" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}