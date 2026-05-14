import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, TrendingUp, Trash2, Check } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { httpClient } from "@/api/httpClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const unidadeLabels = {
  kg: "kg",
  sacos: "sacos",
  caixas: "caixas",
  lote: "lote"
};

export default function ListaVendas({ vendas, loading, onEditar, onDeletar }) {
  const [vendaParaDeletar, setVendaParaDeletar] = useState(null);
  const queryClient = useQueryClient();

  const marcarPagoMutation = useMutation({
    mutationFn: ({ id }) => {
      return httpClient(`/vendas/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          pago: true,
          data_pagamento_efetivo: new Date().toISOString().split('T')[0]
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendas'] });
    },
  });

  const handleMarcarPago = (venda) => {
    if (!venda.pago) {
      marcarPagoMutation.mutate({ id: venda.id });
    }
  };

  const handleDeletar = () => {
    if (vendaParaDeletar) {
      onDeletar(vendaParaDeletar);
      setVendaParaDeletar(null);
    }
  };

  const formatarData = (dataString) => {
    if (!dataString) return '-';
    const dataComHora = dataString.includes('T') ? dataString : `${dataString}T00:00:00`;
    return format(new Date(dataComHora), "d 'de' MMM yyyy", { locale: ptBR });
  };

  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Suas Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex justify-between items-center p-4 border rounded">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!vendas || (Array.isArray(vendas) && vendas.length === 0)) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <TrendingUp className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Nenhuma venda registrada ainda.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Desktop View - Table */}
      <Card className="shadow-lg hidden md:block">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Suas Vendas ({vendas?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Produto</th>
                  <th className="text-left p-3 font-medium">Quantidade</th>
                  <th className="text-left p-3 font-medium">Preço/Unidade</th>
                  <th className="text-left p-3 font-medium">Valor Total</th>
                  <th className="text-left p-3 font-medium">Data Venda</th>
                  <th className="text-left p-3 font-medium">Pagamento</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {vendas.map((venda) => {
                  const itemPrincipal = (venda.itens && venda.itens.length > 0) ? venda.itens[0] : {};
                  const nomeProduto = itemPrincipal.nome_produto || venda.produto || "-";
                  const quantidade = itemPrincipal.quantidade || venda.quantidade || venda.quantidade_kg || 0;
                  const unidade = itemPrincipal.unidade || venda.unidade_venda || "kg";
                  const precoUnidade = Number(itemPrincipal.preco_unitario || venda.preco_por_unidade || venda.preco_por_kg || 0);
                  const cliente = venda.cliente_nome || (venda.cliente && typeof venda.cliente === 'string' ? venda.cliente : (venda.cliente?.nome || '-'));
                  
                  return (
                    <tr key={venda.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{nomeProduto}</p>
                          {cliente !== '-' && (
                            <p className="text-sm text-gray-500">{cliente}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {quantidade} {unidadeLabels[unidade] || unidade}
                        </Badge>
                      </td>
                      <td className="p-3 font-medium">
                        R$ {precoUnidade.toFixed(2)}/{unidadeLabels[unidade] || unidade}
                      </td>
                      <td className="p-3 font-bold text-green-600">
                        R$ {Number(venda?.valor_total || 0).toFixed(2)}
                      </td>
                      <td className="p-3">
                        {formatarData(venda.data_venda)}
                      </td>
                      <td className="p-3">
                        {venda.data_pagamento ? (
                          <div className="text-sm">
                            {formatarData(venda.data_pagamento)}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="p-3">
                        <Badge className={venda.pago ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}>
                          {venda.pago ? 'Pago' : 'Pendente'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEditar(venda)}
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          {!venda.pago && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleMarcarPago(venda)}
                              title="Marcar como pago"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setVendaParaDeletar(venda)}
                            title="Deletar"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Mobile View - Cards */}
      <div className="md:hidden space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5" />
          <h3 className="font-bold text-lg">Suas Vendas ({vendas?.length || 0})</h3>
        </div>
        {vendas.map((venda) => {
          const itemPrincipal = (venda.itens && venda.itens.length > 0) ? venda.itens[0] : {};
          const nomeProduto = itemPrincipal.nome_produto || venda.produto || "-";
          const quantidade = itemPrincipal.quantidade || venda.quantidade || venda.quantidade_kg || 0;
          const unidade = itemPrincipal.unidade || venda.unidade_venda || "kg";
          const precoUnidade = Number(itemPrincipal.preco_unitario || venda.preco_por_unidade || venda.preco_por_kg || 0);
          const cliente = venda.cliente_nome || (venda.cliente && typeof venda.cliente === 'string' ? venda.cliente : (venda.cliente?.nome || '-'));
          
          return (
            <Card key={venda.id} className="shadow-md">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-bold text-lg">{nomeProduto}</h4>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {quantidade} {unidadeLabels[unidade] || unidade}
                      </Badge>
                      <Badge className={venda.pago ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}>
                        {venda.pago ? 'Pago' : 'Pendente'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Preço/{unidadeLabels[unidade] || unidade}:</span>
                    <span className="font-medium">R$ {precoUnidade.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Valor Total:</span>
                    <span className="font-bold text-green-600">R$ {Number(venda.valor_total || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Data Venda:</span>
                    <span className="text-sm">{formatarData(venda.data_venda)}</span>
                  </div>
                  {venda.data_pagamento && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Data Pagamento:</span>
                      <span className="text-sm">{formatarData(venda.data_pagamento)}</span>
                    </div>
                  )}
                  {cliente !== '-' && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Cliente:</span>
                      <span className="text-sm">{cliente}</span>
                    </div>
                  )}
                </div>

                {venda.observacoes && (
                  <p className="text-sm text-gray-500 italic pt-2 border-t mb-3">{venda.observacoes}</p>
                )}

                <div className="flex gap-2 pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditar(venda)}
                    className="flex-1"
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  {!venda.pago && (
                    <Button
                      size="sm"
                      onClick={() => handleMarcarPago(venda)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Pago
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setVendaParaDeletar(venda)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Diálogo de Confirmação */}
      <AlertDialog open={!!vendaParaDeletar} onOpenChange={() => setVendaParaDeletar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a venda de <strong>{vendaParaDeletar?.produto}</strong> no valor de R$ {vendaParaDeletar?.valor_total.toFixed(2)}?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletar} className="bg-red-600 hover:bg-red-700">
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}