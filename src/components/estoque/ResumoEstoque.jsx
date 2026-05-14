import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { startOfMonth, endOfMonth, isWithinInterval } from "date-fns";

export default function ResumoEstoque({ produtos = [], movimentacoes = [] }) {
  const hoje = new Date();
  const inicioMes = startOfMonth(hoje);
  const fimMes = endOfMonth(hoje);

  // Produtos ativos
  const produtosAtivos = (Array.isArray(produtos) ? produtos : []).filter(p => p.ativo).length;

  // Produtos com estoque baixo
  const produtosEstoqueBaixo = (Array.isArray(produtos) ? produtos : []).filter(
    p => p.ativo && p.estoque_minimo > 0 && p.estoque_atual <= p.estoque_minimo
  ).length;

  // Movimentações do mês
  const movimentacoesMes = (Array.isArray(movimentacoes) ? movimentacoes : []).filter(m => {
    const dataMovimentacao = new Date(m.data);
    return isWithinInterval(dataMovimentacao, { start: inicioMes, end: fimMes });
  });

  const entradasMes = movimentacoesMes.filter(m => m.tipo === 'entrada').length;
  const saidasMes = movimentacoesMes.filter(m => m.tipo === 'saida').length;
  const perdasMes = movimentacoesMes.filter(m => m.tipo === 'perda').reduce((sum, m) => sum + (m.quantidade || 0), 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6">
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardHeader className="pb-2 pt-4 px-3 md:px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs md:text-sm font-medium opacity-90">Produtos Ativos</CardTitle>
            <Package className="h-4 w-4 opacity-90" />
          </div>
        </CardHeader>
        <CardContent className="px-3 md:px-4 pb-4">
          <div className="text-lg md:text-2xl font-bold">{produtosAtivos}</div>
          <p className="text-xs opacity-90 mt-1">Em estoque</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <CardHeader className="pb-2 pt-4 px-3 md:px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs md:text-sm font-medium opacity-90">Entradas Mês</CardTitle>
            <TrendingUp className="h-4 w-4 opacity-90" />
          </div>
        </CardHeader>
        <CardContent className="px-3 md:px-4 pb-4">
          <div className="text-lg md:text-2xl font-bold">{entradasMes}</div>
          <p className="text-xs opacity-90 mt-1">Movimentações</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
        <CardHeader className="pb-2 pt-4 px-3 md:px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs md:text-sm font-medium opacity-90">Saídas Mês</CardTitle>
            <TrendingDown className="h-4 w-4 opacity-90" />
          </div>
        </CardHeader>
        <CardContent className="px-3 md:px-4 pb-4">
          <div className="text-lg md:text-2xl font-bold">{saidasMes}</div>
          <p className="text-xs opacity-90 mt-1">Movimentações</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <CardHeader className="pb-2 pt-4 px-3 md:px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs md:text-sm font-medium opacity-90">Alertas</CardTitle>
            <AlertTriangle className="h-4 w-4 opacity-90" />
          </div>
        </CardHeader>
        <CardContent className="px-3 md:px-4 pb-4">
          <div className="text-lg md:text-2xl font-bold">{produtosEstoqueBaixo}</div>
          <p className="text-xs opacity-90 mt-1">Estoque baixo</p>
        </CardContent>
      </Card>
    </div>
  );
}