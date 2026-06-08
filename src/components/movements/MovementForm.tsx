"use client";

import { useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { addPersonalMovement, addBusinessMovement } from "@/lib/services/db";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface MovementFormProps {
  type: 'personal' | 'business';
  isOpen: boolean;
  onClose: () => void;
}

export function MovementForm({ type, isOpen, onClose }: MovementFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    moveType: 'expense' as 'income' | 'expense',
    clientName: '',
    caseReference: ''
  });

  const availableCategories = type === 'personal' 
    ? ['Salário', 'Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Lazer', 'Outras Receitas', 'Outras Despesas']
    : ['Honorários', 'Consultas', 'Aluguel Escritório', 'Marketing', 'Contabilidade', 'Internet'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.currentHouseholdId) return;
    setLoading(true);

    try {
      const baseData = {
        householdId: user.currentHouseholdId,
        ownerUserId: user.uid,
        date: formData.date,
        type: formData.moveType,
        categoryId: formData.category.toLowerCase().replace(/\s/g, '-'),
        categoryName: formData.category,
        description: formData.description,
        amount: parseFloat(formData.amount),
      };

      if (type === 'personal') {
        await addPersonalMovement(user.currentHouseholdId, baseData);
      } else {
        await addBusinessMovement(user.currentHouseholdId, {
          ...baseData,
          businessId: 'main',
          clientName: formData.clientName,
          caseReference: formData.caseReference
        });
      }

      toast({ title: "Sucesso", description: "Lançamento adicionado." });
      setFormData({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: '',
        moveType: 'expense',
        clientName: '',
        caseReference: ''
      });
      onClose();
    } catch (e) {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao salvar." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-primary/20">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">
            {type === 'personal' ? 'Novo Gasto/Receita' : 'Novo Lançamento Escritório'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
            <button 
              type="button" 
              onClick={() => setFormData(p => ({ ...p, moveType: 'expense' }))}
              className={`py-2 rounded-md text-sm font-bold transition-all ${formData.moveType === 'expense' ? 'bg-rose-500 text-white shadow-md' : 'text-muted-foreground'}`}
            >
              Despesa
            </button>
            <button 
              type="button" 
              onClick={() => setFormData(p => ({ ...p, moveType: 'income' }))}
              className={`py-2 rounded-md text-sm font-bold transition-all ${formData.moveType === 'income' ? 'bg-emerald-500 text-white shadow-md' : 'text-muted-foreground'}`}
            >
              Receita
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Descrição</label>
            <Input 
              required 
              placeholder="Ex: Almoço, Honorário Dr. Pedro..." 
              value={formData.description}
              onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
              className="h-12"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Valor</label>
              <Input 
                required 
                type="number" 
                step="0.01" 
                placeholder="0,00" 
                value={formData.amount}
                onChange={e => setFormData(p => ({ ...p, amount: e.target.value }))}
                className="h-12 font-bold text-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Data</label>
              <Input 
                required 
                type="date" 
                value={formData.date}
                onChange={e => setFormData(p => ({ ...p, date: e.target.value }))}
                className="h-12"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Categoria</label>
            <Select value={formData.category} onValueChange={val => setFormData(p => ({ ...p, category: val }))}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {type === 'business' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Cliente</label>
                <Input value={formData.clientName} onChange={e => setFormData(p => ({ ...p, clientName: e.target.value }))} placeholder="Opcional" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Processo</label>
                <Input value={formData.caseReference} onChange={e => setFormData(p => ({ ...p, caseReference: e.target.value }))} placeholder="Opcional" />
              </div>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full h-12 text-lg font-bold shadow-lg">
            {loading ? 'Salvando...' : 'Confirmar Lançamento'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}