import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Package, Trash2, Check } from "lucide-react";
import { format } from "date-fns";
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

export default function ListaCompras({ compras, loading, onEditar, onDeletar }) {
  const [compraParaDeletar, setCompraParaDeletar] = useState(null);
  const queryClient = useQueryClient();

  const marcarPagoMutation = useMutation({
    mutationFn: ({ id }) => {
      return base44.entities.Compra.update(id, {
        pago: true,
        data_pagamento_efetivo: new Date().toISOString().split('T')[0]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras'] });
    },
  });

  const handleMarcarPago = (compra) => {
    if (!compra.pago) {
      marcarPagoMutation.mutate({ id: compra.id });
    }
  };

  const handleDeletar = () => {
    if (compraParaDeletar) {
      onDeletar(compraParaDeletar);
      setCompraParaDeletar(null);
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
          <CardTitle>Suas Compras</CardTitle>
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

  if (compras.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Nenhuma compra registrada ainda.</p>
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
            <Package className="w-5 h-5" />
            Suas Compras ({compras.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Produto</th>
                  <th className="text-left p-3 font-medium">Quantidade</th>
                  <th className="text-left p-3 font-medium">Valor/Unidade</th>
                  <th className="text-left p-3 font-medium">Valor Total</th>
                  <th className="text-left p-3 font-medium">Data Compra</th>
                  <th className="text-left p-3 font-medium">Pagamento</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {compras.map((compra) => (
                  <tr key={compra.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{compra.produto}</p>
                        {compra.fornecedor && (
                          <p className="text-sm text-gray-500">{compra.fornecedor}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant="secondary">
                        {compra.quantidade} {compra.unidade_compra}
                      </Badge>
                    </td>
                    <td className="p-3 font-medium">
                      R$ {compra.valor_por_unidade?.toFixed(2) || '0.00'}
                    </td>
                    <td className="p-3 font-bold text-red-600">
                      R$ {compra.valor_total.toFixed(2)}
                    </td>
                    <td className="p-3">
                      {formatarData(compra.data_compra)}
                    </td>
                    <td className="p-3">
                      {compra.data_pagamento ? (
                        <div className="text-sm">
                          {formatarData(compra.data_pagamento)}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="p-3">
                      <Badge className={compra.pago ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}>
                        {compra.pago ? 'Pago' : 'Pendente'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEditar(compra)}
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        {!compra.pago && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleMarcarPago(compra)}
                            title="Marcar como pago"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setCompraParaDeletar(compra)}
                          title="Deletar"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Mobile View - Cards */}
      <div className="md:hidden space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5" />
          <h3 className="font-bold text-lg">Suas Compras ({compras.length})</h3>
        </div>
        {compras.map((compra) => (
          <Card key={compra.id} className="shadow-md">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className="font-bold text-lg">{compra.produto}</h4>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="secondary">
                      {compra.quantidade} {compra.unidade_compra}
                    </Badge>
                    <Badge className={compra.pago ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}>
                      {compra.pago ? 'Pago' : 'Pendente'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Valor/Unidade:</span>
                  <span className="font-medium">R$ {compra.valor_por_unidade?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Valor Total:</span>
                  <span className="font-bold text-red-600">R$ {compra.valor_total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Data Compra:</span>
                  <span className="text-sm">{formatarData(compra.data_compra)}</span>
                </div>
                {compra.data_pagamento && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Data Pagamento:</span>
                    <span className="text-sm">{formatarData(compra.data_pagamento)}</span>
                  </div>
                )}
                {compra.fornecedor && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Fornecedor:</span>
                    <span className="text-sm">{compra.fornecedor}</span>
                  </div>
                )}
              </div>

              {compra.observacoes && (
                <p className="text-sm text-gray-500 italic pt-2 border-t mb-3">{compra.observacoes}</p>
              )}

              <div className="flex gap-2 pt-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditar(compra)}
                  className="flex-1"
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                {!compra.pago && (
                  <Button
                    size="sm"
                    onClick={() => handleMarcarPago(compra)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Pago
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCompraParaDeletar(compra)}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Diálogo de Confirmação */}
      <AlertDialog open={!!compraParaDeletar} onOpenChange={() => setCompraParaDeletar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a compra de <strong>{compraParaDeletar?.produto}</strong> no valor de R$ {compraParaDeletar?.valor_total.toFixed(2)}?
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