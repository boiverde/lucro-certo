import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PagamentosControle({ vendas = [], compras = [] }) {
  const [filtro, setFiltro] = useState('todos');

  const formatarData = (dataString) => {
    if (!dataString) return '-';
    const dataComHora = dataString.includes('T') ? dataString : `${dataString}T00:00:00`;
    return format(new Date(dataComHora), "d 'de' MMM yyyy", { locale: ptBR });
  };

  const getStatusPagamento = (item) => {
    if (item.pago) return { label: 'Pago', color: 'bg-green-100 text-green-800' };
    if (!item.data_pagamento) return { label: 'Sem data', color: 'bg-gray-100 text-gray-800' };
    
    const data = new Date(item.data_pagamento);
    if (isToday(data)) return { label: 'Vence hoje', color: 'bg-orange-100 text-orange-800' };
    if (isPast(data)) return { label: 'Atrasado', color: 'bg-red-100 text-red-800' };
    return { label: 'A vencer', color: 'bg-blue-100 text-blue-800' };
  };

  // Vendas pendentes
  const vendasPendentes = vendas
    .filter(v => !v.pago && v.data_pagamento)
    .sort((a, b) => new Date(a.data_pagamento) - new Date(b.data_pagamento));

  const vendasVencidas = vendasPendentes.filter(v => isPast(new Date(v.data_pagamento)) && !isToday(new Date(v.data_pagamento)));
  const vendasHoje = vendasPendentes.filter(v => isToday(new Date(v.data_pagamento)));
  const vendasFuturas = vendasPendentes.filter(v => !isPast(new Date(v.data_pagamento)) && !isToday(new Date(v.data_pagamento)));

  // Compras pendentes
  const comprasPendentes = compras
    .filter(c => !c.pago && c.data_pagamento)
    .sort((a, b) => new Date(a.data_pagamento) - new Date(b.data_pagamento));

  const comprasVencidas = comprasPendentes.filter(c => isPast(new Date(c.data_pagamento)) && !isToday(new Date(c.data_pagamento)));
  const comprasHoje = comprasPendentes.filter(c => isToday(new Date(c.data_pagamento)));
  const comprasFuturas = comprasPendentes.filter(c => !isPast(new Date(c.data_pagamento)) && !isToday(new Date(c.data_pagamento)));

  const totalVendasPendentes = vendasPendentes.reduce((sum, v) => sum + v.valor_total, 0);
  const totalComprasPendentes = comprasPendentes.reduce((sum, c) => sum + c.valor_total, 0);
  const saldoPendente = totalVendasPendentes - totalComprasPendentes;

  const VendaCard = ({ venda }) => {
    const status = getStatusPagamento(venda);
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h4 className="font-bold text-lg">{venda.produto}</h4>
              {venda.cliente && (
                <p className="text-sm text-gray-500">{venda.cliente}</p>
              )}
            </div>
            <Badge className={status.color}>{status.label}</Badge>
          </div>
          <div className="flex justify-between items-center mt-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              {formatarData(venda.data_pagamento)}
            </div>
            <span className="text-lg font-bold text-green-600">R$ {venda.valor_total.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  const CompraCard = ({ compra }) => {
    const status = getStatusPagamento(compra);
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h4 className="font-bold text-lg">{compra.produto}</h4>
              {compra.fornecedor && (
                <p className="text-sm text-gray-500">{compra.fornecedor}</p>
              )}
            </div>
            <Badge className={status.color}>{status.label}</Badge>
          </div>
          <div className="flex justify-between items-center mt-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              {formatarData(compra.data_pagamento)}
            </div>
            <span className="text-lg font-bold text-red-600">R$ {compra.valor_total.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">A Receber</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalVendasPendentes.toFixed(2)}</div>
            <p className="text-xs opacity-90 mt-1">{vendasPendentes.length} vendas</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">A Pagar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalComprasPendentes.toFixed(2)}</div>
            <p className="text-xs opacity-90 mt-1">{comprasPendentes.length} compras</p>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-r ${saldoPendente >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} text-white`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Saldo Pendente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {Math.abs(saldoPendente).toFixed(2)}</div>
            <p className="text-xs opacity-90 mt-1">{saldoPendente >= 0 ? 'Positivo' : 'Negativo'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {(vendasVencidas.length > 0 || comprasVencidas.length > 0 || vendasHoje.length > 0 || comprasHoje.length > 0) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900 mb-2">Atenção aos Pagamentos</h3>
                <div className="space-y-1 text-sm text-orange-800">
                  {vendasVencidas.length > 0 && <p>• {vendasVencidas.length} venda(s) com pagamento atrasado</p>}
                  {comprasVencidas.length > 0 && <p>• {comprasVencidas.length} compra(s) com pagamento atrasado</p>}
                  {vendasHoje.length > 0 && <p>• {vendasHoje.length} venda(s) vence(m) hoje</p>}
                  {comprasHoje.length > 0 && <p>• {comprasHoje.length} compra(s) vence(m) hoje</p>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="vendas" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="vendas">
            <TrendingUp className="w-4 h-4 mr-2" />
            Vendas a Receber
          </TabsTrigger>
          <TabsTrigger value="compras">
            <TrendingDown className="w-4 h-4 mr-2" />
            Compras a Pagar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vendas" className="space-y-6">
          {vendasPendentes.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <TrendingUp className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">Nenhuma venda pendente de pagamento</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {vendasVencidas.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-red-600">Atrasadas ({vendasVencidas.length})</h3>
                  <div className="grid gap-3">
                    {vendasVencidas.map(venda => <VendaCard key={venda.id} venda={venda} />)}
                  </div>
                </div>
              )}

              {vendasHoje.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-orange-600">Vencem Hoje ({vendasHoje.length})</h3>
                  <div className="grid gap-3">
                    {vendasHoje.map(venda => <VendaCard key={venda.id} venda={venda} />)}
                  </div>
                </div>
              )}

              {vendasFuturas.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-blue-600">Futuras ({vendasFuturas.length})</h3>
                  <div className="grid gap-3">
                    {vendasFuturas.map(venda => <VendaCard key={venda.id} venda={venda} />)}
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="compras" className="space-y-6">
          {comprasPendentes.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <TrendingDown className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">Nenhuma compra pendente de pagamento</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {comprasVencidas.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-red-600">Atrasadas ({comprasVencidas.length})</h3>
                  <div className="grid gap-3">
                    {comprasVencidas.map(compra => <CompraCard key={compra.id} compra={compra} />)}
                  </div>
                </div>
              )}

              {comprasHoje.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-orange-600">Vencem Hoje ({comprasHoje.length})</h3>
                  <div className="grid gap-3">
                    {comprasHoje.map(compra => <CompraCard key={compra.id} compra={compra} />)}
                  </div>
                </div>
              )}

              {comprasFuturas.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-blue-600">Futuras ({comprasFuturas.length})</h3>
                  <div className="grid gap-3">
                    {comprasFuturas.map(compra => <CompraCard key={compra.id} compra={compra} />)}
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}