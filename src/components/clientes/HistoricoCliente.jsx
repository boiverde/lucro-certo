import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingBag, DollarSign, Calendar, Package } from "lucide-react";
import { format, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function HistoricoCliente({ cliente, vendas, onVoltar }) {
  const totalVendas = vendas.length;
  const valorTotal = vendas.reduce((sum, v) => sum + v.valor_total, 0);
  const comissaoTotal = vendas.reduce((sum, v) => sum + v.valor_comissao_total, 0);
  const vendasAtivas = vendas.filter(v => v.status === 'ativa').length;
  const vendasPagas = vendas.filter(v => v.status === 'paga').length;

  const statusColors = {
    ativa: "bg-blue-100 text-blue-800",
    paga: "bg-green-100 text-green-800",
    cancelada: "bg-red-100 text-red-800"
  };

  const statusLabels = {
    ativa: "Ativa",
    paga: "Paga",
    cancelada: "Cancelada"
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onVoltar}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2 className="text-xl font-bold">{cliente.nome}</h2>
          <p className="text-sm text-gray-500">Histórico de compras</p>
        </div>
      </div>

      {/* Cards de Resumo do Cliente */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingBag className="w-4 h-4 text-gray-500" />
              <p className="text-xs text-gray-600">Total Vendas</p>
            </div>
            <p className="text-2xl font-bold text-purple-600">{totalVendas}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <p className="text-xs text-gray-600">Valor Total</p>
            </div>
            <p className="text-2xl font-bold text-green-600">R$ {valorTotal.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <p className="text-xs text-gray-600">Comissões</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">R$ {comissaoTotal.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <p className="text-xs text-gray-600">Status</p>
            </div>
            <p className="text-sm">
              <span className="text-blue-600 font-bold">{vendasAtivas}</span> ativas · {" "}
              <span className="text-green-600 font-bold">{vendasPagas}</span> pagas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Vendas */}
      {vendas.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <ShoppingBag className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Nenhuma venda registrada para este cliente.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Histórico de Compras</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {vendas.map((venda) => {
                const proximaParcelaNumero = venda.parcelas_pagas + 1;
                const proximaParcelaData = addMonths(
                  new Date(venda.data_primeira_parcela),
                  venda.parcelas_pagas
                );

                return (
                  <div key={venda.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{venda.empresa_nome}</Badge>
                          <Badge className={statusColors[venda.status]}>
                            {statusLabels[venda.status]}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          {format(new Date(venda.data_primeira_parcela), "d 'de' MMM 'de' yyyy", { locale: ptBR })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-purple-600">
                          R$ {venda.valor_total.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Comissão: R$ {venda.valor_comissao_total.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Produtos Vendidos */}
                    {venda.produto && (
                      <div className="bg-blue-50 rounded-lg p-3 mb-3">
                        <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          Produto(s)
                        </p>
                        <p className="text-sm text-gray-700 font-medium whitespace-pre-line">
                          {venda.produto}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500">Parcelas</p>
                        <p className="font-medium">{venda.parcelas_pagas}/{venda.numero_parcelas}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Valor/Parcela</p>
                        <p className="font-medium">R$ {venda.valor_parcela.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Comissão %</p>
                        <p className="font-medium">{venda.porcentagem_comissao}%</p>
                      </div>
                      {venda.status === 'ativa' && (
                        <div>
                          <p className="text-gray-500">Próxima Parcela</p>
                          <p className="font-medium">
                            {format(proximaParcelaData, "d 'de' MMM", { locale: ptBR })}
                          </p>
                        </div>
                      )}
                    </div>

                    {venda.observacoes && (
                      <p className="text-sm text-gray-500 mt-3 pt-3 border-t italic">
                        💬 {venda.observacoes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}