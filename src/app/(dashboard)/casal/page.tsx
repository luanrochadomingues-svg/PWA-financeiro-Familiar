"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { getMovements, getHouseholdMembers } from "@/lib/services/db";
import { Movement, HouseholdMember } from "@/lib/models";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Heart, TrendingUp, UserCheck, Wallet } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function CasalPage() {
  const { user } = useAuth();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [members, setMembers] = useState<HouseholdMember[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.currentHouseholdId) return;
      const [m, mem] = await Promise.all([
        getMovements(user.currentHouseholdId, 'personal'),
        getHouseholdMembers(user.currentHouseholdId)
      ]);
      setMovements(m);
      setMembers(mem);
    };
    fetchData();
  }, [user]);

  const totals = movements.reduce((acc, m) => {
    if (m.type === 'income') acc.income += m.amount;
    else acc.expense += m.amount;
    return acc;
  }, { income: 0, expense: 0 });

  const byUser = members.map(member => {
    const userMoves = movements.filter(m => m.ownerUserId === member.userId);
    const inc = userMoves.filter(m => m.type === 'income').reduce((s, m) => s + m.amount, 0);
    const exp = userMoves.filter(m => m.type === 'expense').reduce((s, m) => s + m.amount, 0);
    return { name: member.displayName, income: inc, expense: exp, balance: inc - exp };
  });

  const chartData = byUser.map(u => ({ name: u.name, value: u.expense }));
  const COLORS = ['#8C96D9', '#ADCBEB', '#4C51BF'];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-headline font-bold text-primary flex items-center gap-2">
          Finanças do Casal <Heart className="w-6 h-6 fill-rose-500 text-rose-500" />
        </h1>
        <p className="text-muted-foreground">Visão consolidada da casa</p>
      </header>

      <div className="grid grid-cols-1 gap-4">
        <Card className="bg-card/80 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase text-muted-foreground flex items-center gap-2">
              <Wallet className="w-4 h-4" /> Saldo Total Casa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h2 className="text-4xl font-headline font-bold">
              R$ {(totals.income - totals.expense).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h2>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-[10px] text-muted-foreground font-bold uppercase">Total Receitas</p>
              <p className="text-xl font-bold text-emerald-500">R$ {totals.income.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-[10px] text-muted-foreground font-bold uppercase">Total Despesas</p>
              <p className="text-xl font-bold text-rose-500">R$ {totals.expense.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-headline">Gastos por Pessoa</CardTitle>
          </CardHeader>
          <CardContent className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <h3 className="text-lg font-headline font-bold">Resumo por Membro</h3>
          {byUser.map((u, i) => (
            <Card key={i} className="bg-card border-none shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <UserCheck className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold">{u.name}</p>
                    <p className="text-xs text-muted-foreground">Saldo Individual</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${u.balance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    R$ {u.balance.toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}