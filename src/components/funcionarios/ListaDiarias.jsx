import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, DollarSign, Trash2, Check, X } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ListaDiarias({ diarias, loading, onEditar, onDeletar, onMarcarPago }) {
  const [diariaParaDeletar, setDiariaParaDeletar] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState("todos");

  const handleDeletar = () => {
    if (diariaParaDeletar) {
      onDeletar(diariaParaDeletar);
      setDiariaParaDeletar(null);
    }
  };

  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Diárias</CardTitle>
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

  const diariasFiltradas = filtroStatus === "todos" 
    ? diarias 
    : diarias.filter(d => filtroStatus === "pagas" ? d.pago : !d.pago);

  if (diarias.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <DollarSign className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Nenhuma diária registrada ainda.</p>
        </CardContent>
      </Card>
    );
  }

  const totalPendente = diarias.filter(d => !d.pago).reduce((sum, d) => sum + d.valor_total, 0);
  const totalPago = diarias.filter(d => d.pago).reduce((sum, d) => sum + d.valor_total, 0);

  return (
    <>
      {/* Resumo */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <p className="text-sm text-orange-800 font-medium">A Pagar</p>
            <p className="text-2xl font-bold text-orange-600">R$ {totalPendente.toFixed(2)}</p>
            <p className="text-xs text-orange-700 mt-1">
              {diarias.filter(d => !d.pago).length} diária(s)
            </p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <p className="text-sm text-green-800 font-medium">Pago</p>
            <p className="text-2xl font-bold text-green-600">R$ {totalPago.toFixed(2)}</p>
            <p className="text-xs text-green-700 mt-1">
              {diarias.filter(d => d.pago).length} diária(s)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtro */}
      <div className="mb-4">
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filtrar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas</SelectItem>
            <SelectItem value="pendentes">A Pagar</SelectItem>
            <SelectItem value="pagas">Pagas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Desktop View - Table */}
      <Card className="shadow-lg hidden md:block">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Diárias ({diariasFiltradas.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Data</th>
                  <th className="text-left p-3 font-medium">Funcionário</th>
                  <th className="text-left p-3 font-medium">Diária</th>
                  <th className="text-left p-3 font-medium">Passagem</th>
                  <th className="text-left p-3 font-medium">Alimentação</th>
                  <th className="text-left p-3 font-medium">Total</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {diariasFiltradas.map((diaria) => (
                  <tr key={diaria.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-sm">
                      {format(new Date(diaria.data), "d 'de' MMM yyyy", { locale: ptBR })}
                    </td>
                    <td className="p-3">
                      <p className="font-medium">{diaria.funcionario_nome}</p>
                      {diaria.observacoes && (
                        <p className="text-xs text-gray-500 truncate max-w-xs">{diaria.observacoes}</p>
                      )}
                    </td>
                    <td className="p-3">R$ {diaria.valor_diaria.toFixed(2)}</td>
                    <td className="p-3">R$ {diaria.valor_passagem.toFixed(2)}</td>
                    <td className="p-3">R$ {diaria.valor_alimentacao.toFixed(2)}</td>
                    <td className="p-3 font-bold text-green-600">
                      R$ {diaria.valor_total.toFixed(2)}
                    </td>
                    <td className="p-3">
                      <Badge className={diaria.pago ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}>
                        {diaria.pago ? (
                          <>
                            <Check className="w-3 h-3 mr-1" />
                            Pago
                          </>
                        ) : (
                          <>
                            <X className="w-3 h-3 mr-1" />
                            Pendente
                          </>
                        )}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        {!diaria.pago && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onMarcarPago(diaria)}
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            title="Marcar como pago"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEditar(diaria)}
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDiariaParaDeletar(diaria)}
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
          <DollarSign className="w-5 h-5" />
          <h3 className="font-bold text-lg">Diárias ({diariasFiltradas.length})</h3>
        </div>
        {diariasFiltradas.map((diaria) => (
          <Card key={diaria.id} className="shadow-md">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className="font-bold text-lg">{diaria.funcionario_nome}</h4>
                  <p className="text-sm text-gray-500">
                    {format(new Date(diaria.data), "d 'de' MMM yyyy", { locale: ptBR })}
                  </p>
                </div>
                <Badge className={diaria.pago ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}>
                  {diaria.pago ? 'Pago' : 'Pendente'}
                </Badge>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Diária:</span>
                  <span className="font-medium">R$ {diaria.valor_diaria.toFixed(2)}</span>
                </div>
                {diaria.valor_passagem > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Passagem:</span>
                    <span className="font-medium">R$ {diaria.valor_passagem.toFixed(2)}</span>
                  </div>
                )}
                {diaria.valor_alimentacao > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Alimentação:</span>
                    <span className="font-medium">R$ {diaria.valor_alimentacao.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold text-green-600">R$ {diaria.valor_total.toFixed(2)}</span>
                </div>
              </div>

              {diaria.observacoes && (
                <p className="text-sm text-gray-500 mb-3 italic">{diaria.observacoes}</p>
              )}

              <div className={`grid ${!diaria.pago ? 'grid-cols-3' : 'grid-cols-2'} gap-2 pt-3 border-t`}>
                {!diaria.pago && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onMarcarPago(diaria)}
                    className="text-green-600 border-green-200"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditar(diaria)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDiariaParaDeletar(diaria)}
                  className="text-red-600 border-red-200"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Diálogo de Confirmação */}
      <AlertDialog open={!!diariaParaDeletar} onOpenChange={() => setDiariaParaDeletar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a diária de <strong>{diariaParaDeletar?.funcionario_nome}</strong> no valor de R$ {diariaParaDeletar?.valor_total.toFixed(2)}?
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