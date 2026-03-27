import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, TrendingUp, Receipt, Store } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function UltimasTransacoes({ compras, vendas, gastos, vendasRevenda = [] }) {
  const formatarData = (dataString) => {
    const dataComHora = dataString.includes('T') ? dataString : `${dataString}T00:00:00`;
    return format(new Date(dataComHora), "d 'de' MMM", { locale: ptBR });
  };

  // Combinar todas as transações e ordenar por data
  const todasTransacoes = [
    ...compras.slice(0, 5).map(c => ({
      ...c,
      tipo: 'compra',
      data: c.data_compra,
      valor: c.valor_total,
      descricao: `${c.quantidade} ${c.unidade_compra} de ${c.produto}`,
      icon: ShoppingCart,
      cor: 'bg-red-100 text-red-800'
    })),
    ...vendas.slice(0, 5).map(v => ({
      ...v,
      tipo: 'venda',
      data: v.data_venda,
      valor: v.valor_total,
      descricao: `${v.quantidade || 0} ${v.unidade_venda || 'unidades'} de ${v.produto}`,
      icon: TrendingUp,
      cor: 'bg-green-100 text-green-800'
    })),
    ...gastos.slice(0, 5).map(g => ({
      ...g,
      tipo: 'gasto',
      data: g.data,
      valor: g.valor,
      descricao: g.descricao,
      icon: Receipt,
      cor: 'bg-orange-100 text-orange-800'
    })),
    ...vendasRevenda.slice(0, 3).map(vr => ({
      ...vr,
      tipo: 'revenda',
      data: vr.data_primeira_parcela,
      valor: vr.valor_comissao_total,
      descricao: `${vr.cliente} - ${vr.empresa_nome}`,
      icon: Store,
      cor: 'bg-pink-100 text-pink-800'
    }))
  ].sort((a, b) => {
    const dataA = a.data.includes('T') ? new Date(a.data) : new Date(`${a.data}T00:00:00`);
    const dataB = b.data.includes('T') ? new Date(b.data) : new Date(`${b.data}T00:00:00`);
    return dataB - dataA;
  }).slice(0, 8);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Últimas Transações</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {todasTransacoes.map((transacao, index) => {
            const Icon = transacao.icon;
            return (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-full">
                    <Icon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{transacao.descricao}</p>
                    <p className="text-xs text-gray-500">
                      {formatarData(transacao.data)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className={transacao.cor}>
                    {transacao.tipo}
                  </Badge>
                  <p className="font-semibold text-sm mt-1">
                    R$ {transacao.valor.toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}