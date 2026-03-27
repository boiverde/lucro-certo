import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowUp, AlertCircle, History } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const tipoConfig = {
  entrada: {
    label: "Entrada",
    color: "bg-green-100 text-green-800",
    icon: ArrowDown
  },
  saida: {
    label: "Saída",
    color: "bg-red-100 text-red-800",
    icon: ArrowUp
  },
  perda: {
    label: "Perda",
    color: "bg-orange-100 text-orange-800",
    icon: AlertCircle
  },
  ajuste: {
    label: "Ajuste",
    color: "bg-blue-100 text-blue-800",
    icon: AlertCircle
  }
};

export default function HistoricoMovimentacoes({ movimentacoes, loading }) {
  const [filtroTipo, setFiltroTipo] = useState("todos");

  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Histórico de Movimentações</CardTitle>
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

  const movimentacoesFiltradas = filtroTipo === "todos" 
    ? movimentacoes 
    : movimentacoes.filter(m => m.tipo === filtroTipo);

  if (movimentacoes.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <History className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Nenhuma movimentação registrada ainda.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Histórico de Movimentações ({movimentacoesFiltradas.length})
          </CardTitle>
          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas</SelectItem>
              <SelectItem value="entrada">Entradas</SelectItem>
              <SelectItem value="saida">Saídas</SelectItem>
              <SelectItem value="perda">Perdas</SelectItem>
              <SelectItem value="ajuste">Ajustes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium">Data</th>
                <th className="text-left p-3 font-medium">Produto</th>
                <th className="text-left p-3 font-medium">Tipo</th>
                <th className="text-left p-3 font-medium">Quantidade</th>
                <th className="text-left p-3 font-medium">Origem</th>
                <th className="text-left p-3 font-medium">Observações</th>
              </tr>
            </thead>
            <tbody>
              {movimentacoesFiltradas.map((mov) => {
                const config = tipoConfig[mov.tipo];
                const Icon = config.icon;
                
                return (
                  <tr key={mov.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-sm">
                      {format(new Date(mov.data), "d 'de' MMM yyyy", { locale: ptBR })}
                    </td>
                    <td className="p-3 font-medium">{mov.produto_nome}</td>
                    <td className="p-3">
                      <Badge className={config.color}>
                        <Icon className="w-3 h-3 mr-1" />
                        {config.label}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <span className={`font-bold ${
                        mov.tipo === 'entrada' ? 'text-green-600' : 
                        mov.tipo === 'saida' ? 'text-red-600' : 
                        mov.tipo === 'perda' ? 'text-orange-600' : 'text-blue-600'
                      }`}>
                        {mov.tipo === 'entrada' ? '+' : mov.tipo === 'ajuste' ? '=' : '-'}{mov.quantidade}
                      </span>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline">
                        {mov.origem === 'manual' ? 'Manual' : 
                         mov.origem === 'venda' ? 'Venda' : 
                         mov.origem === 'compra' ? 'Compra' : 'Inventário'}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm text-gray-600 max-w-xs truncate">
                      {mov.observacoes || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden space-y-3">
          {movimentacoesFiltradas.map((mov) => {
            const config = tipoConfig[mov.tipo];
            const Icon = config.icon;
            
            return (
              <Card key={mov.id} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold">{mov.produto_nome}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(mov.data), "d 'de' MMM yyyy", { locale: ptBR })}
                      </p>
                    </div>
                    <Badge className={config.color}>
                      <Icon className="w-3 h-3 mr-1" />
                      {config.label}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3 pt-3 border-t">
                    <span className="text-sm text-gray-600">Quantidade:</span>
                    <span className={`font-bold text-lg ${
                      mov.tipo === 'entrada' ? 'text-green-600' : 
                      mov.tipo === 'saida' ? 'text-red-600' : 
                      mov.tipo === 'perda' ? 'text-orange-600' : 'text-blue-600'
                    }`}>
                      {mov.tipo === 'entrada' ? '+' : mov.tipo === 'ajuste' ? '=' : '-'}{mov.quantidade}
                    </span>
                  </div>
                  
                  {mov.observacoes && (
                    <p className="text-sm text-gray-500 mt-2 italic">{mov.observacoes}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}