import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ResumoLucro({ compras, vendas, gastos, vendasRevenda = [] }) {
  // Gerar dados dos últimos 6 meses
  const ultimosMeses = [];
  for (let i = 5; i >= 0; i--) {
    const mes = subMonths(new Date(), i);
    const inicioMes = startOfMonth(mes);
    const fimMes = endOfMonth(mes);

    const comprasMes = compras.filter(c => {
      const data = new Date(c.data_compra);
      return data >= inicioMes && data <= fimMes;
    });

    const vendasMes = vendas.filter(v => {
      const data = new Date(v.data_venda);
      return data >= inicioMes && data <= fimMes;
    });

    const gastosMes = gastos.filter(g => {
      const data = new Date(g.data);
      return data >= inicioMes && data <= fimMes;
    });

    const vendasRevendaMes = vendasRevenda.filter(vr => {
      const data = new Date(vr.created_date);
      return data >= inicioMes && data <= fimMes;
    });

    // Calcular comissões recebidas (parcelas pagas)
    const comissoesMes = vendasRevendaMes.reduce((total, venda) => {
      if (venda.status === 'cancelada' || !venda.numero_parcelas || venda.numero_parcelas === 0) {
        return total;
      }
      
      const comissaoPorParcela = venda.valor_comissao_total / venda.numero_parcelas;
      total += comissaoPorParcela * venda.parcelas_pagas;
      
      return total;
    }, 0);

    const totalCompras = comprasMes.reduce((sum, c) => sum + c.valor_total, 0);
    const totalVendas = vendasMes.reduce((sum, v) => sum + v.valor_total, 0);
    const totalGastos = gastosMes.reduce((sum, g) => sum + g.valor, 0);
    const totalRevendas = vendasRevendaMes.reduce((sum, vr) => sum + vr.valor_total, 0);
    const lucro = totalVendas + totalRevendas + comissoesMes - totalCompras - totalGastos;

    ultimosMeses.push({
      mes: format(mes, 'MMM', { locale: ptBR }),
      vendas: totalVendas,
      revendas: totalRevendas,
      compras: totalCompras,
      gastos: totalGastos,
      comissoes: comissoesMes,
      lucro: lucro
    });
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Resumo de Lucro - Últimos 6 Meses</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={ultimosMeses}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip 
              formatter={(value) => [`R$ ${value.toFixed(2)}`, '']}
              labelFormatter={(label) => `Mês: ${label}`}
            />
            <Bar dataKey="vendas" fill="#10b981" name="Vendas" />
            <Bar dataKey="revendas" fill="#a855f7" name="Revendas" />
            <Bar dataKey="compras" fill="#ef4444" name="Compras" />
            <Bar dataKey="gastos" fill="#f97316" name="Gastos" />
            <Bar dataKey="comissoes" fill="#ec4899" name="Comissões" />
            <Bar dataKey="lucro" fill="#3b82f6" name="Lucro" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}