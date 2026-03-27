import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Clock, AlertCircle } from "lucide-react";
import { format, addMonths, isBefore, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function ListaPagamentos({ vendas }) {
  const [filtro, setFiltro] = useState('pendentes');
  const queryClient = useQueryClient();

  const marcarPagaMutation = useMutation({
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

  const handleMarcarPaga = (venda) => {
    if (venda.parcelas_pagas < venda.numero_parcelas) {
      marcarPagaMutation.mutate({
        id: venda.id,
        parcelasPagas: venda.parcelas_pagas,
        numeroParcelas: venda.numero_parcelas
      });
    }
  };

  // Gerar lista de todas as parcelas
  const todasParcelas = [];
  vendas.forEach(venda => {
    if (venda.status === 'cancelada') return;
    
    for (let i = 0; i < venda.numero_parcelas; i++) {
      const dataParcela = addMonths(new Date(venda.data_primeira_parcela), i);
      const paga = i < venda.parcelas_pagas;
      const valorParcela = venda.valor_parcela;
      const comissaoParcela = venda.valor_comissao_total / venda.numero_parcelas;
      const hoje = startOfDay(new Date());
      const atrasada = !paga && isBefore(startOfDay(dataParcela), hoje);

      todasParcelas.push({
        vendaId: venda.id,
        venda: venda,
        cliente: venda.cliente,
        empresa: venda.empresa_nome,
        numeroParcela: i + 1,
        totalParcelas: venda.numero_parcelas,
        dataParcela: dataParcela,
        valorParcela: valorParcela,
        comissaoParcela: comissaoParcela,
        paga: paga,
        atrasada: atrasada,
        status: paga ? 'paga' : (atrasada ? 'atrasada' : 'pendente')
      });
    }
  });

  // Filtrar parcelas
  const parcelasFiltradas = todasParcelas.filter(p => {
    if (filtro === 'pendentes') return !p.paga;
    if (filtro === 'atrasadas') return p.atrasada;
    if (filtro === 'pagas') return p.paga;
    return true;
  }).sort((a, b) => new Date(a.dataParcela) - new Date(b.dataParcela));

  const totalPendente = parcelasFiltradas.filter(p => !p.paga).reduce((sum, p) => sum + p.valorParcela, 0);
  const comissaoPendente = parcelasFiltradas.filter(p => !p.paga).reduce((sum, p) => sum + p.comissaoParcela, 0);
  const atrasadasCount = todasParcelas.filter(p => p.atrasada).length;

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Parcelas Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {parcelasFiltradas.filter(p => !p.paga).length}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              R$ {totalPendente.toFixed(2)} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Comissão Pendente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {comissaoPendente.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Seu ganho futuro</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Atrasadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {atrasadasCount}
            </div>
            <p className="text-xs text-gray-500 mt-1">Precisam atenção</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Tabs value={filtro} onValueChange={setFiltro}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
          <TabsTrigger value="atrasadas">
            Atrasadas
            {atrasadasCount > 0 && (
              <Badge variant="destructive" className="ml-2">{atrasadasCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pagas">Pagas</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Lista de Parcelas */}
      <Card>
        <CardContent className="p-0">
          {parcelasFiltradas.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Nenhuma parcela {filtro} encontrada.</p>
            </div>
          ) : (
            <div className="divide-y">
              {parcelasFiltradas.map((parcela, index) => (
                <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {parcela.cliente}
                        </h3>
                        {parcela.atrasada && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Atrasada
                          </Badge>
                        )}
                        {parcela.paga && (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            <Check className="w-3 h-3 mr-1" />
                            Paga
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Empresa:</span>
                          <Badge variant="outline" className="ml-2">{parcela.empresa}</Badge>
                        </div>
                        <div>
                          <span className="text-gray-500">Parcela:</span>
                          <span className="ml-2 font-medium">
                            {parcela.numeroParcela}/{parcela.totalParcelas}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Vencimento:</span>
                          <span className="ml-2 font-medium">
                            {format(parcela.dataParcela, "dd/MM/yyyy")}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Valor:</span>
                          <span className="ml-2 font-bold text-purple-600">
                            R$ {parcela.valorParcela.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 text-sm">
                        <span className="text-gray-500">Sua comissão:</span>
                        <span className="ml-2 font-bold text-green-600">
                          R$ {parcela.comissaoParcela.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {!parcela.paga && (
                      <Button
                        size="sm"
                        onClick={() => handleMarcarPaga(parcela.venda)}
                        disabled={parcela.numeroParcela !== parcela.venda.parcelas_pagas + 1}
                        className="bg-green-600 hover:bg-green-700 shrink-0"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Marcar Paga
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}