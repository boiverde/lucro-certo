import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function RelatorioLucros({ compras, vendas, gastos, vendasRevenda = [] }) {
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

    // Calcular comissões recebidas (parcelas pagas neste mês)
    const comissoesMes = vendasRevenda.reduce((total, venda) => {
      if (venda.status === 'cancelada' || !venda.numero_parcelas || venda.numero_parcelas === 0) {
        return total;
      }
      
      const comissaoPorParcela = venda.valor_comissao_total / venda.numero_parcelas;
      
      for (let j = 0; j < venda.parcelas_pagas; j++) {
        const dataParcela = addMonths(new Date(venda.data_primeira_parcela), j);
        if (dataParcela >= inicioMes && dataParcela <= fimMes) {
          total += comissaoPorParcela;
        }
      }
      
      return total;
    }, 0);

    const totalCompras = comprasMes.reduce((sum, c) => sum + c.valor_total, 0);
    const totalVendas = vendasMes.reduce((sum, v) => sum + v.valor_total, 0);
    const totalGastos = gastosMes.reduce((sum, g) => sum + g.valor, 0);
    
    // CORRIGIDO: Lucro = Vendas - Compras + Comissões - Gastos
    const lucro = totalVendas - totalCompras + comissoesMes - totalGastos;

    ultimosMeses.push({
      mes: format(mes, 'MMM', { locale: ptBR }),
      vendas: totalVendas,
      compras: totalCompras,
      gastos: totalGastos,
      comissoes: comissoesMes,
      lucro: lucro
    });
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Evolução dos Lucros - Últimos 6 Meses</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={ultimosMeses}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip 
              formatter={(value) => [`R$ ${value.toFixed(2)}`, '']}
              labelFormatter={(label) => `Mês: ${label}`}
            />
            <Line dataKey="vendas" stroke="#10b981" name="Vendas" strokeWidth={2} dot={false} />
            <Line dataKey="compras" stroke="#ef4444" name="Compras" strokeWidth={2} dot={false} />
            <Line dataKey="gastos" stroke="#f97316" name="Gastos" strokeWidth={2} dot={false} />
            <Line dataKey="comissoes" stroke="#ec4899" name="Comissões" strokeWidth={2} dot={false} />
            <Line dataKey="lucro" stroke="#3b82f6" name="Lucro" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}