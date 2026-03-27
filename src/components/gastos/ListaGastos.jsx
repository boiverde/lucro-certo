import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

const tipoColors = {
  alimentacao: "bg-orange-100 text-orange-800",
  gasolina: "bg-blue-100 text-blue-800",
  diaria_funcionario: "bg-green-100 text-green-800",
  transporte: "bg-purple-100 text-purple-800",
  manutencao: "bg-red-100 text-red-800",
  outros: "bg-gray-100 text-gray-800"
};

const tipoLabels = {
  alimentacao: "Alimentação",
  gasolina: "Gasolina",
  diaria_funcionario: "Diária",
  transporte: "Transporte",
  manutencao: "Manutenção",
  outros: "Outros"
};

export default function ListaGastos({ gastos, loading, onEditar, onDeletar }) {
  const [gastoParaDeletar, setGastoParaDeletar] = useState(null);

  const handleDeletar = () => {
    if (gastoParaDeletar) {
      onDeletar(gastoParaDeletar);
      setGastoParaDeletar(null);
    }
  };

  const formatarData = (dataString) => {
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

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Seus Gastos ({gastos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Funcionário</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gastos.map((gasto) => (
                  <TableRow key={gasto.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <p className="font-medium">{gasto.descricao}</p>
                        {gasto.observacoes && (
                          <p className="text-sm text-gray-500">{gasto.observacoes}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={tipoColors[gasto.tipo]}>
                        {tipoLabels[gasto.tipo]}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-orange-600">
                      R$ {gasto.valor.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {formatarData(gasto.data)}
                    </TableCell>
                    <TableCell>
                      {gasto.funcionario || '-'}
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                  </TableRow>
                ))}
                {gastos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Nenhum gasto registrado ainda.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

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