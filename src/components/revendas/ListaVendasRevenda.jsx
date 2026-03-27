import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, ShoppingBag, Check, Trash2 } from "lucide-react";
import { format, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { base44 } from "@/api/base44Client";
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

export default function ListaVendasRevenda({ vendas, loading, onEditar, onDeletar }) {
  const [vendaParaDeletar, setVendaParaDeletar] = useState(null);
  const queryClient = useQueryClient();

  const marcarParcelaPagaMutation = useMutation({
    mutationFn: ({ id, parcelasPagas, numeroParcelas }) => {
      const novasParcelasPagas = parcelasPagas + 1;
      const novoStatus = novasParcelasPagas >= numeroParcelas ? 'paga' : 'ativa';
      return base44.entities.VendaRevenda.update(id, {
        parcelas_pagas: novasParcelasPagas,
        status: novoStatus
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendas-revenda'] });
    },
  });

  const handleMarcarParcela = (venda) => {
    if (venda.parcelas_pagas < venda.numero_parcelas) {
      marcarParcelaPagaMutation.mutate({
        id: venda.id,
        parcelasPagas: venda.parcelas_pagas,
        numeroParcelas: venda.numero_parcelas
      });
    }
  };

  const handleDeletar = () => {
    if (vendaParaDeletar) {
      onDeletar(vendaParaDeletar);
      setVendaParaDeletar(null);
    }
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
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (vendas.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <ShoppingBag className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Nenhuma venda registrada ainda.</p>
          <p className="text-sm text-gray-400 mt-1">Comece registrando suas vendas de revenda!</p>
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
            <ShoppingBag className="w-5 h-5" />
            Suas Vendas ({vendas.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Cliente</th>
                  <th className="text-left p-3 font-medium">Empresa</th>
                  <th className="text-left p-3 font-medium">Valor Total</th>
                  <th className="text-left p-3 font-medium">Parcelas</th>
                  <th className="text-left p-3 font-medium">Próxima Parcela</th>
                  <th className="text-left p-3 font-medium">Comissão</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {vendas.map((venda) => {
                  const proximaParcelaNumero = venda.parcelas_pagas + 1;
                  const proximaParcelaData = addMonths(
                    new Date(venda.data_primeira_parcela),
                    venda.parcelas_pagas
                  );

                  return (
                    <tr key={venda.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{venda.cliente}</p>
                          {venda.observacoes && (
                            <p className="text-sm text-gray-500 truncate max-w-xs">{venda.observacoes}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">{venda.empresa_nome}</Badge>
                      </td>
                      <td className="p-3 font-bold text-purple-600">
                        R$ {venda.valor_total.toFixed(2)}
                      </td>
                      <td className="p-3">
                        <div className="text-sm">
                          <div className="font-medium">{venda.parcelas_pagas}/{venda.numero_parcelas}</div>
                          <div className="text-xs text-gray-500">R$ {venda.valor_parcela.toFixed(2)}/mês</div>
                        </div>
                      </td>
                      <td className="p-3">
                        {venda.status === 'ativa' ? (
                          <div className="text-sm">
                            <div className="font-medium">Parcela {proximaParcelaNumero}</div>
                            <div className="text-xs text-gray-500">
                              {format(proximaParcelaData, "d 'de' MMM", { locale: ptBR })}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-3 font-bold text-green-600">
                        R$ {venda.valor_comissao_total.toFixed(2)}
                        <div className="text-xs text-gray-500">({venda.porcentagem_comissao}%)</div>
                      </td>
                      <td className="p-3">
                        <Badge className={statusColors[venda.status]}>
                          {statusLabels[venda.status]}
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
                          {venda.status === 'ativa' && venda.parcelas_pagas < venda.numero_parcelas && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleMarcarParcela(venda)}
                              title="Marcar parcela como paga"
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
          <ShoppingBag className="w-5 h-5" />
          <h3 className="font-bold text-lg">Suas Vendas ({vendas.length})</h3>
        </div>
        {vendas.map((venda) => {
          const proximaParcelaNumero = venda.parcelas_pagas + 1;
          const proximaParcelaData = addMonths(
            new Date(venda.data_primeira_parcela),
            venda.parcelas_pagas
          );

          return (
            <Card key={venda.id} className="shadow-md">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-bold text-lg">{venda.cliente}</h4>
                    <Badge variant="outline" className="mt-1">{venda.empresa_nome}</Badge>
                  </div>
                  <Badge className={statusColors[venda.status]}>
                    {statusLabels[venda.status]}
                  </Badge>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Valor Total:</span>
                    <span className="font-bold text-purple-600">R$ {venda.valor_total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Parcelas:</span>
                    <span className="font-medium">{venda.parcelas_pagas}/{venda.numero_parcelas} (R$ {venda.valor_parcela.toFixed(2)})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Comissão:</span>
                    <span className="font-bold text-green-600">R$ {venda.valor_comissao_total.toFixed(2)}</span>
                  </div>
                  {venda.status === 'ativa' && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Próxima Parcela:</span>
                      <span className="text-sm">
                        {format(proximaParcelaData, "d 'de' MMM", { locale: ptBR })}
                      </span>
                    </div>
                  )}
                </div>

                {venda.observacoes && (
                  <p className="text-sm text-gray-500 mb-3 italic">{venda.observacoes}</p>
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
                  {venda.status === 'ativa' && venda.parcelas_pagas < venda.numero_parcelas && (
                    <Button
                      size="sm"
                      onClick={() => handleMarcarParcela(venda)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Marcar Paga
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setVendaParaDeletar(venda)}
                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
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
              Tem certeza que deseja excluir a venda de <strong>{vendaParaDeletar?.cliente}</strong> na empresa <strong>{vendaParaDeletar?.empresa_nome}</strong> no valor de R$ {vendaParaDeletar?.valor_total.toFixed(2)}?
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