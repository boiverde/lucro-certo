import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Receipt, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
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

export default function ListaGastosRevenda({ gastos, loading, onEditar, onDeletar }) {
  const [gastoParaDeletar, setGastoParaDeletar] = useState(null);

  const handleDeletar = () => {
    if (gastoParaDeletar) {
      onDeletar(gastoParaDeletar);
      setGastoParaDeletar(null);
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
          <CardTitle>Seus Gastos</CardTitle>
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

  if (gastos.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Receipt className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Nenhum gasto registrado ainda.</p>
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
            <Receipt className="w-5 h-5" />
            Seus Gastos ({gastos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Descrição</th>
                  <th className="text-left p-3 font-medium">Empresa</th>
                  <th className="text-left p-3 font-medium">Valor</th>
                  <th className="text-left p-3 font-medium">Data</th>
                  <th className="text-left p-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {gastos.map((gasto) => (
                  <tr key={gasto.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{gasto.descricao}</p>
                        {gasto.observacoes && (
                          <p className="text-sm text-gray-500 truncate max-w-xs">{gasto.observacoes}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      {gasto.empresa_nome ? (
                        <Badge variant="outline">{gasto.empresa_nome}</Badge>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-3 font-bold text-orange-600">
                      R$ {gasto.valor.toFixed(2)}
                    </td>
                    <td className="p-3">
                      {formatarData(gasto.data)}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEditar(gasto)}
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setGastoParaDeletar(gasto)}
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
          <Receipt className="w-5 h-5" />
          <h3 className="font-bold text-lg">Seus Gastos ({gastos.length})</h3>
        </div>
        {gastos.map((gasto) => (
          <Card key={gasto.id} className="shadow-md">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className="font-bold text-lg">{gasto.descricao}</h4>
                  {gasto.empresa_nome && (
                    <Badge variant="outline" className="mt-1">{gasto.empresa_nome}</Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Valor:</span>
                  <span className="font-bold text-orange-600">R$ {gasto.valor.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Data:</span>
                  <span className="text-sm">{formatarData(gasto.data)}</span>
                </div>
              </div>

              {gasto.observacoes && (
                <p className="text-sm text-gray-500 mb-3 italic">{gasto.observacoes}</p>
              )}

              <div className="flex gap-2 pt-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditar(gasto)}
                  className="flex-1"
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setGastoParaDeletar(gasto)}
                  className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Deletar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Diálogo de Confirmação */}
      <AlertDialog open={!!gastoParaDeletar} onOpenChange={() => setGastoParaDeletar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o gasto <strong>{gastoParaDeletar?.descricao}</strong> no valor de R$ {gastoParaDeletar?.valor.toFixed(2)}?
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