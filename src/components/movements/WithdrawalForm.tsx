"use client";

import { useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { createProLabore } from "@/lib/services/db";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Landmark } from "lucide-react";

export function WithdrawalForm({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('Retirada mensal');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.currentHouseholdId) return;
    setLoading(true);

    try {
      await createProLabore(user.currentHouseholdId, {
        amount: parseFloat(amount),
        date,
        userId: user.uid,
        userName: user.displayName,
        description,
        notes: ''
      });

      toast({ title: "Transferência Realizada", description: "O valor foi descontado do escritório e adicionado ao seu pessoal." });
      onClose();
    } catch (e) {
      toast({ variant: "destructive", title: "Erro", description: "Falha na transferência." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-primary/20">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl flex items-center gap-2">
            Retirada Pró-labore <Landmark className="w-5 h-5" />
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Esta ação criará uma <strong>Despesa no Escritório</strong> e uma <strong>Receita no seu Pessoal</strong> vinculadas automaticamente.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Valor da Retirada</label>
              <Input 
                required 
                type="number" 
                step="0.01" 
                placeholder="0,00" 
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="h-14 font-bold text-2xl text-primary text-center"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Data</label>
              <Input 
                required 
                type="date" 
                value={date}
                onChange={e => setDate(e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Finalidade</label>
              <Input 
                required 
                placeholder="Ex: Pagamento pró-labore Jan/2024" 
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="h-12"
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-14 text-lg font-bold shadow-xl">
            {loading ? 'Processando...' : 'Confirmar Retirada'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}