import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, Package, Receipt, Trash2, Clock, CheckCircle, XCircle, PlayCircle } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

export default function ListaPedidos({ pedidos, loading, onDeletar, onAtualizarStatus, diasAlertaPendente = 3 }) {
  const [pedidoParaDeletar, setPedidoParaDeletar] = useState(null);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-full mb-3" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (pedidos.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">Nenhum pedido encontrado</p>
        </CardContent>
      </Card>
    );
  }

  const statusColors = {
    pendente: "bg-yellow-100 text-yellow-800",
    em_andamento: "bg-blue-100 text-blue-800",
    concluido: "bg-green-100 text-green-800",
    cancelado: "bg-red-100 text-red-800"
  };

  const statusLabels = {
    pendente: "Pendente",
    em_andamento: "Em Andamento",
    concluido: "Concluído",
    cancelado: "Cancelado"
  };

  const statusIcons = {
    pendente: Clock,
    em_andamento: PlayCircle,
    concluido: CheckCircle,
    cancelado: XCircle
  };

  const formaPagamentoLabels = {
    dinheiro: "Dinheiro",
    cartao_debito: "Cartão de Débito",
    cartao_credito: "Cartão de Crédito",
    pix: "PIX"
  };

  return (
    <>
      <div className="space-y-4">
        {pedidos.map(pedido => {
          const diasPendente = pedido.status === 'pendente' 
            ? differenceInDays(new Date(), new Date(pedido.data_pedido))
            : 0;
          const alertaPendente = diasPendente >= diasAlertaPendente;
          const StatusIcon = statusIcons[pedido.status];

          return (
            <Card key={pedido.id} className={alertaPendente ? 'border-2 border-orange-500' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <CardTitle className="text-lg">Pedido #{pedido.numero_pedido}</CardTitle>
                      <Badge className={statusColors[pedido.status]}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusLabels[pedido.status]}
                      </Badge>
                      {alertaPendente && (
                        <Badge className="bg-orange-500 text-white">
                          ⚠️ {diasPendente} dias pendente
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(pedido.data_pedido), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </div>
                    {pedido.cliente && (
                      <div className="text-sm text-gray-700 mt-1">
                        <strong>Cliente:</strong> {pedido.cliente}
                      </div>
                    )}
                    
                    {onAtualizarStatus && (
                      <div className="mt-3">
                        <Select 
                          value={pedido.status} 
                          onValueChange={(novoStatus) => onAtualizarStatus(pedido, novoStatus)}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pendente">Pendente</SelectItem>
                            <SelectItem value="em_andamento">Em Andamento</SelectItem>
                            <SelectItem value="concluido">Concluído</SelectItem>
                            <SelectItem value="cancelado">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPedidoParaDeletar(pedido)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  {pedido.itens?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2 flex-1">
                        {item.tipo === "receita" ? (
                          <ShoppingBag className="w-4 h-4 text-orange-600" />
                        ) : (
                          <Package className="w-4 h-4 text-blue-600" />
                        )}
                        <div>
                          <div className="font-medium">{item.nome}</div>
                          <div className="text-sm text-gray-500">
                            {item.quantidade}x R$ {item.valor_unitario.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <div className="font-semibold">
                        R$ {item.valor_total.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>R$ {pedido.valor_total.toFixed(2)}</span>
                  </div>
                  {pedido.desconto > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Desconto:</span>
                      <span>- R$ {pedido.desconto.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span className="text-green-600">R$ {pedido.valor_final.toFixed(2)}</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    <strong>Pagamento:</strong> {formaPagamentoLabels[pedido.forma_pagamento] || pedido.forma_pagamento}
                  </div>
                  {pedido.observacoes && (
                    <div className="text-sm text-gray-600 mt-2">
                      <strong>Obs:</strong> {pedido.observacoes}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AlertDialog open={!!pedidoParaDeletar} onOpenChange={() => setPedidoParaDeletar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o pedido #{pedidoParaDeletar?.numero_pedido}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDeletar(pedidoParaDeletar);
                setPedidoParaDeletar(null);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}