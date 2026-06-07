"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { getMovements, deleteMovement } from "@/lib/services/db";
import { Movement, BusinessMovement } from "@/lib/models";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Gavel, ArrowUpRight, ArrowDownLeft, Trash2, Landmark } from "lucide-react";
import { MovementForm } from "@/components/movements/MovementForm";
import { WithdrawalForm } from "@/components/movements/WithdrawalForm";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function JuridicoPage() {
  const { user } = useAuth();
  const [movements, setMovements] = useState<BusinessMovement[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  const fetchMovements = async () => {
    if (!user?.currentHouseholdId) return;
    const data = await getMovements(user.currentHouseholdId, 'business') as BusinessMovement[];
    setMovements(data);
  };

  useEffect(() => {
    fetchMovements();
  }, [user]);

  const totals = movements.reduce((acc, m) => {
    if (m.type === 'income') acc.revenue += m.amount;
    else acc.expense += m.amount;
    return acc;
  }, { revenue: 0, expense: 0 });

  const profit = totals.revenue - totals.expense;

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary flex items-center gap-2">
            Escritório <Gavel className="w-7 h-7" />
          </h1>
          <p className="text-muted-foreground">Gestão de Honorários e Despesas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="rounded-full w-12 h-12 bg-card border-primary/20" onClick={() => setIsWithdrawOpen(true)}>
            <Landmark className="w-5 h-5 text-primary" />
          </Button>
          <Button size="icon" className="rounded-full w-12 h-12 shadow-lg" onClick={() => setIsFormOpen(true)}>
            <Plus className="w-6 h-6" />
          </Button>
        </div>
      </header>

      <Card className="bg-secondary text-secondary-foreground">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs uppercase tracking-widest font-bold opacity-70">Lucro do Mês</p>
              <h2 className="text-4xl font-headline font-bold">R$ {profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
            </div>
            <ArrowUpRight className="w-10 h-10 opacity-10" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-[10px] text-muted-foreground font-bold uppercase">Faturamento</p>
            <p className="text-lg font-bold text-emerald-500">R$ {totals.revenue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-[10px] text-muted-foreground font-bold uppercase">Custos Operacionais</p>
            <p className="text-lg font-bold text-rose-500">R$ {totals.expense.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-headline font-bold">Fluxo de Caixa</h3>
        {movements.length === 0 ? (
          <p className="text-center py-10 text-muted-foreground italic">Seu escritório ainda não tem lançamentos.</p>
        ) : (
          movements.map((m) => (
            <Card key={m.id} className="group">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${m.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    {m.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{m.description}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {m.categoryName} {m.clientName ? `• Cliente: ${m.clientName}` : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-sm ${m.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    R$ {m.amount.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{format(new Date(m.date), "dd MMM")}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <MovementForm type="business" isOpen={isFormOpen} onClose={() => { setIsFormOpen(false); fetchMovements(); }} />
      <WithdrawalForm isOpen={isWithdrawOpen} onClose={() => { setIsWithdrawOpen(false); fetchMovements(); }} />
    </div>
  );
}