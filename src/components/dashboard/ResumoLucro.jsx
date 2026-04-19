import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ResumoLucro({ vendasTotal = 0, comprasTotal = 0, gastosTotal = 0, comissoesTotal = 0 }) {
  
  const lucroTotal = (vendasTotal + comissoesTotal) - comprasTotal - gastosTotal;

  // Dados simplificados para o Dashboard v2.2 (Visão Geral)
  const data = [
    { name: 'Vendas', valor: vendasTotal, cor: '#4f46e5' },
    { name: 'Comissões', valor: comissoesTotal, cor: '#ec4899' },
    { name: 'Compras', valor: comprasTotal, cor: '#f43f5e' },
    { name: 'Gastos', valor: gastosTotal, cor: '#f59e0b' },
    { name: 'Lucro', valor: lucroTotal, cor: '#10b981' }
  ];

  return (
    <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
      <CardHeader className="pb-2 pt-6 px-6">
        <CardTitle className="text-sm font-black text-gray-400 uppercase tracking-widest">Desempenho Financeiro</CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="h-[250px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 10 }}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, '']}
              />
              <Bar dataKey="valor" radius={[6, 6, 0, 0]} barSize={40}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
            <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Resultado Líquido</p>
            <p className="text-xl font-black text-emerald-700">R$ {lucroTotal.toFixed(2)}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Volume de Giro</p>
            <p className="text-xl font-black text-slate-700">R$ {(vendasTotal + comprasTotal).toFixed(2)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}