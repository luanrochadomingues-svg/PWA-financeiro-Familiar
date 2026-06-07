"use client";

import { useAuth } from "@/lib/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LogOut, User, Home, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AjustesPage() {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-headline font-bold text-primary">Ajustes</h1>
        <p className="text-muted-foreground">Gerencie sua conta e household</p>
      </header>

      <div className="space-y-4">
        <Card className="bg-card/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 border-2 border-primary/20">
                <AvatarImage src={`https://picsum.photos/seed/${user?.uid}/100/100`} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">{user?.displayName?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-headline font-bold">{user?.displayName}</h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-2">
          <Button variant="outline" className="justify-start h-14 gap-3 bg-card border-primary/10">
            <Home className="w-5 h-5 text-primary" />
            <div className="text-left">
              <p className="text-sm font-bold">Household</p>
              <p className="text-xs text-muted-foreground">ID: {user?.currentHouseholdId}</p>
            </div>
          </Button>
          <Button variant="outline" className="justify-start h-14 gap-3 bg-card border-primary/10">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <div className="text-left">
              <p className="text-sm font-bold">Segurança</p>
              <p className="text-xs text-muted-foreground">Firestore Security Rules v1</p>
            </div>
          </Button>
        </div>

        <Button 
          variant="destructive" 
          onClick={logout} 
          className="w-full h-12 gap-2 shadow-lg"
        >
          <LogOut className="w-5 h-5" />
          Sair do Nexo
        </Button>
      </div>

      <footer className="text-center pt-10">
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Nexo Financeiro v0.1.0 MVP</p>
      </footer>
    </div>
  );
}