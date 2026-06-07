"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { getMovements, deleteMovement } from "@/lib/services/db";
import { Movement } from "@/lib/models";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowUpCircle, ArrowDownCircle, Trash2, TrendingUp } from "lucide-react";
import { MovementForm } from "@/components/movements/MovementForm";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function PessoalPage() {
  const { user } = useAuth();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchMovements = async () => {
    if (!user?.currentHouseholdId) return;
    const data = await getMovements(user.currentHouseholdId, 'personal', user.uid);
    setMovements(data);
  };

  useEffect(() => {
    fetchMovements();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!user?.currentHouseholdId || !confirm("Deseja realmente excluir este lançamento?")) return;
    await deleteMovement(user.currentHouseholdId, 'personal', id);
    fetchMovements();
  };

  const totals = movements.reduce((acc, m) => {
    if (m.type === 'income') acc.income += m.amount;
    else acc.expense += m.amount;
    return acc;
  }, { income: 0, expense: 0 });

  const balance = totals.income - totals.expense;

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Minhas Finanças</h1>
          <p className="text-muted-foreground">{format(new Date(), "MMMM, yyyy", { locale: ptBR })}</p>
        </div>
        <Button size="icon" className="rounded-full w-12 h-12 shadow-lg" onClick={() => setIsFormOpen(true)}>
          <Plus className="w-6 h-6" />
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-4">
        <Card className="bg-primary text-primary-foreground overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm opacity-80 font-medium">Saldo Atual</p>
                <h2 className="text-4xl font-headline font-bold">R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
              </div>
              <TrendingUp className="w-8 h-8 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-card">
            <CardContent className="pt-4 flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <ArrowUpCircle className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Receitas</p>
                <p className="text-lg font-bold text-emerald-500">R$ {totals.income.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="pt-4 flex items-center gap-3">
              <div className="p-2 bg-rose-500/10 rounded-lg">
                <ArrowDownCircle className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Despesas</p>
                <p className="text-lg font-bold text-rose-500">R$ {totals.expense.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-headline font-bold ml-1">Lançamentos Recentes</h3>
        {movements.length === 0 ? (
          <p className="text-center py-10 text-muted-foreground">Nenhum lançamento encontrado.</p>
        ) : (
          movements.map((m) => (
            <Card key={m.id} className="group hover:border-primary/50 transition-colors">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-10 rounded-full ${m.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <div>
                    <p className="font-bold text-sm leading-tight">{m.description}</p>
                    <p className="text-xs text-muted-foreground">{m.categoryName} • {format(new Date(m.date), "dd/MM")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-bold ${m.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {m.type === 'income' ? '+' : '-'} R$ {m.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <button onClick={() => handleDelete(m.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-rose-500/10 rounded-full text-rose-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <MovementForm 
        type="personal" 
        isOpen={isFormOpen} 
        onClose={() => {
          setIsFormOpen(false);
          fetchMovements();
        }} 
      />
    </div>
  );
}