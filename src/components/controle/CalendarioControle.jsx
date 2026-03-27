import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function CalendarioControle({ vendas, compras }) {
  const [mesAtual, setMesAtual] = useState(new Date());
  const [diasSelecionado, setDiaSelecionado] = useState(null);

  const inicioMes = startOfMonth(mesAtual);
  const fimMes = endOfMonth(mesAtual);
  const diasDoMes = eachDayOfInterval({ start: inicioMes, end: fimMes });

  const primeiroDiaSemana = getDay(inicioMes);
  const diasVazios = Array(primeiroDiaSemana).fill(null);

  const eventosPorDia = {};

  // Função para normalizar data (evitar problema de timezone)
  const normalizarData = (dataString) => {
    if (!dataString) return null;
    const dataComHora = dataString.includes('T') ? dataString : `${dataString}T00:00:00`;
    return dataComHora.split('T')[0]; // Retorna apenas YYYY-MM-DD
  };

  // Vendas - data de venda
  vendas.forEach(venda => {
    if (venda.data_venda) {
      const dataKey = normalizarData(venda.data_venda);
      const dataVenda = new Date(dataKey + 'T12:00:00'); // Meio-dia para evitar timezone
      if (isSameMonth(dataVenda, mesAtual)) {
        const diaKey = format(dataVenda, 'yyyy-MM-dd');
        if (!eventosPorDia[diaKey]) {
          eventosPorDia[diaKey] = { vendasRealizadas: [], comprasRealizadas: [], vendasReceber: [], comprasPagar: [] };
        }
        eventosPorDia[diaKey].vendasRealizadas.push(venda);
      }
    }
  });

  // Vendas - data de pagamento
  vendas.forEach(venda => {
    if (!venda.pago && venda.data_pagamento) {
      const dataKey = normalizarData(venda.data_pagamento);
      const dataPagamento = new Date(dataKey + 'T12:00:00');
      if (isSameMonth(dataPagamento, mesAtual)) {
        const diaKey = format(dataPagamento, 'yyyy-MM-dd');
        if (!eventosPorDia[diaKey]) {
          eventosPorDia[diaKey] = { vendasRealizadas: [], comprasRealizadas: [], vendasReceber: [], comprasPagar: [] };
        }
        eventosPorDia[diaKey].vendasReceber.push(venda);
      }
    }
  });

  // Compras - data de compra
  compras.forEach(compra => {
    if (compra.data_compra) {
      const dataKey = normalizarData(compra.data_compra);
      const dataCompra = new Date(dataKey + 'T12:00:00');
      if (isSameMonth(dataCompra, mesAtual)) {
        const diaKey = format(dataCompra, 'yyyy-MM-dd');
        if (!eventosPorDia[diaKey]) {
          eventosPorDia[diaKey] = { vendasRealizadas: [], comprasRealizadas: [], vendasReceber: [], comprasPagar: [] };
        }
        eventosPorDia[diaKey].comprasRealizadas.push(compra);
      }
    }
  });

  // Compras - data de pagamento
  compras.forEach(compra => {
    if (!compra.pago && compra.data_pagamento) {
      const dataKey = normalizarData(compra.data_pagamento);
      const dataPagamento = new Date(dataKey + 'T12:00:00');
      if (isSameMonth(dataPagamento, mesAtual)) {
        const diaKey = format(dataPagamento, 'yyyy-MM-dd');
        if (!eventosPorDia[diaKey]) {
          eventosPorDia[diaKey] = { vendasRealizadas: [], comprasRealizadas: [], vendasReceber: [], comprasPagar: [] };
        }
        eventosPorDia[diaKey].comprasPagar.push(compra);
      }
    }
  });

  const mesAnterior = () => setMesAtual(state => {
    const newDate = new Date(state);
    newDate.setMonth(newDate.getMonth() - 1);
    return newDate;
  });

  const proximoMes = () => setMesAtual(state => {
    const newDate = new Date(state);
    newDate.setMonth(newDate.getMonth() + 1);
    return newDate;
  });

  const formatarDataBR = (dataString) => {
    if (!dataString) return '-';
    const dataKey = normalizarData(dataString);
    return format(new Date(dataKey + 'T12:00:00'), "dd/MM/yyyy", { locale: ptBR });
  };

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <CalendarIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Calendário de Controle</span>
              <span className="sm:hidden">Calendário</span>
            </CardTitle>
            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={mesAnterior}
                className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <span className="font-semibold text-sm md:text-lg min-w-[120px] md:min-w-[200px] text-center">
                {format(mesAtual, "MMM yyyy", { locale: ptBR })}
              </span>
              <button
                onClick={proximoMes}
                className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((dia, idx) => (
              <div key={idx} className="text-center font-semibold text-xs md:text-sm text-gray-600 py-1 md:py-2">
                <span className="hidden sm:inline">{['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][idx]}</span>
                <span className="sm:hidden">{dia}</span>
              </div>
            ))}
            
            {diasVazios.map((_, idx) => (
              <div key={`vazio-${idx}`} className="min-h-[60px] md:min-h-[100px]"></div>
            ))}

            {diasDoMes.map(dia => {
              const diaKey = format(dia, 'yyyy-MM-dd');
              const eventos = eventosPorDia[diaKey] || { vendasRealizadas: [], comprasRealizadas: [], vendasReceber: [], comprasPagar: [] };
              const hoje = isSameDay(dia, new Date());
              
              const todosEventos = [
                ...eventos.vendasRealizadas.map(v => ({ tipo: 'vendaRealizada', item: v })),
                ...eventos.comprasRealizadas.map(c => ({ tipo: 'compraRealizada', item: c })),
                ...eventos.vendasReceber.map(v => ({ tipo: 'vendaReceber', item: v })),
                ...eventos.comprasPagar.map(c => ({ tipo: 'compraPagar', item: c }))
              ];

              const totalEventos = todosEventos.length;

              return (
                <div
                  key={diaKey}
                  onClick={() => totalEventos > 0 && setDiaSelecionado({ data: dia, eventos })}
                  className={`min-h-[60px] md:min-h-[100px] p-1 md:p-2 border rounded-lg ${
                    hoje ? 'bg-blue-50 border-blue-300' : 'bg-white'
                  } ${totalEventos > 0 ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
                >
                  <div className={`text-xs md:text-sm font-medium mb-1 ${hoje ? 'text-blue-600' : ''}`}>
                    {format(dia, 'd')}
                  </div>
                  <div className="space-y-1">
                    {todosEventos.slice(0, 2).map((evento, idx) => {
                      const nomeExibir = evento.item.cliente || evento.item.fornecedor || evento.item.produto;
                      
                      if (evento.tipo === 'vendaRealizada') {
                        return (
                          <div
                            key={`vr-${idx}`}
                            className="w-full text-left text-[10px] md:text-xs p-0.5 md:p-1 rounded bg-green-200 text-green-900 border border-green-300"
                          >
                            <div className="font-medium truncate">✓ {nomeExibir}</div>
                            <div className="font-semibold">R$ {evento.item.valor_total.toFixed(0)}</div>
                          </div>
                        );
                      }
                      if (evento.tipo === 'compraRealizada') {
                        return (
                          <div
                            key={`cr-${idx}`}
                            className="w-full text-left text-[10px] md:text-xs p-0.5 md:p-1 rounded bg-red-200 text-red-900 border border-red-300"
                          >
                            <div className="font-medium truncate">✓ {nomeExibir}</div>
                            <div className="font-semibold">R$ {evento.item.valor_total.toFixed(0)}</div>
                          </div>
                        );
                      }
                      if (evento.tipo === 'vendaReceber') {
                        return (
                          <div
                            key={`vrec-${idx}`}
                            className="w-full text-left text-[10px] md:text-xs p-0.5 md:p-1 rounded bg-green-50 text-green-700 border border-green-200"
                          >
                            <div className="font-medium truncate">↑ {nomeExibir}</div>
                            <div className="font-semibold">R$ {evento.item.valor_total.toFixed(0)}</div>
                          </div>
                        );
                      }
                      if (evento.tipo === 'compraPagar') {
                        return (
                          <div
                            key={`cp-${idx}`}
                            className="w-full text-left text-[10px] md:text-xs p-0.5 md:p-1 rounded bg-red-50 text-red-700 border border-red-200"
                          >
                            <div className="font-medium truncate">↓ {nomeExibir}</div>
                            <div className="font-semibold">R$ {evento.item.valor_total.toFixed(0)}</div>
                          </div>
                        );
                      }
                    })}
                    {totalEventos > 2 && (
                      <div className="text-[10px] text-center text-gray-500 w-full font-medium">
                        +{totalEventos - 2} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 md:mt-6 flex flex-wrap gap-3 md:gap-4 text-xs md:text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 md:w-4 md:h-4 bg-green-200 border border-green-300 rounded"></div>
              <span>Venda realizada ✓</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 md:w-4 md:h-4 bg-green-50 border border-green-200 rounded"></div>
              <span>Venda a receber ↑</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 md:w-4 md:h-4 bg-red-200 border border-red-300 rounded"></div>
              <span>Compra realizada ✓</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 md:w-4 md:h-4 bg-red-50 border border-red-200 rounded"></div>
              <span>Compra a pagar ↓</span>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-4 text-center">
            💡 Clique nos dias para ver detalhes das transações
          </p>
        </CardContent>
      </Card>

      {/* Modal de Detalhes do Dia */}
      <Dialog open={!!diasSelecionado} onOpenChange={() => setDiaSelecionado(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {diasSelecionado && format(diasSelecionado.data, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </DialogTitle>
          </DialogHeader>

          {diasSelecionado && (
            <div className="space-y-6 mt-4">
              {/* Vendas Realizadas */}
              {diasSelecionado.eventos.vendasRealizadas.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-green-700 flex items-center gap-2">
                    ✓ Vendas Realizadas ({diasSelecionado.eventos.vendasRealizadas.length})
                  </h3>
                  <div className="space-y-2">
                    {diasSelecionado.eventos.vendasRealizadas.map((venda, idx) => (
                      <div key={idx} className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-green-900">{venda.cliente || 'Sem cliente'}</p>
                            <p className="text-sm text-green-700">{venda.produto}</p>
                          </div>
                          <p className="font-bold text-green-700 text-lg">R$ {venda.valor_total.toFixed(2)}</p>
                        </div>
                        <div className="flex gap-2 text-xs text-green-600">
                          <Badge variant="secondary" className="bg-green-100">
                            {venda.quantidade} {venda.unidade_venda}
                          </Badge>
                          <Badge variant="secondary" className={venda.pago ? 'bg-green-200' : 'bg-orange-100 text-orange-800'}>
                            {venda.pago ? 'Pago' : 'Pendente'}
                          </Badge>
                        </div>
                        {venda.observacoes && (
                          <p className="text-xs text-gray-600 mt-2 italic">{venda.observacoes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vendas a Receber */}
              {diasSelecionado.eventos.vendasReceber.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-green-600 flex items-center gap-2">
                    ↑ Vendas a Receber ({diasSelecionado.eventos.vendasReceber.length})
                  </h3>
                  <div className="space-y-2">
                    {diasSelecionado.eventos.vendasReceber.map((venda, idx) => (
                      <div key={idx} className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-green-900">{venda.cliente || 'Sem cliente'}</p>
                            <p className="text-sm text-green-700">{venda.produto}</p>
                            <p className="text-xs text-gray-600">Vendido em: {formatarDataBR(venda.data_venda)}</p>
                          </div>
                          <p className="font-bold text-green-700 text-lg">R$ {venda.valor_total.toFixed(2)}</p>
                        </div>
                        {venda.observacoes && (
                          <p className="text-xs text-gray-600 mt-2 italic">{venda.observacoes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Compras Realizadas */}
              {diasSelecionado.eventos.comprasRealizadas.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-red-700 flex items-center gap-2">
                    ✓ Compras Realizadas ({diasSelecionado.eventos.comprasRealizadas.length})
                  </h3>
                  <div className="space-y-2">
                    {diasSelecionado.eventos.comprasRealizadas.map((compra, idx) => (
                      <div key={idx} className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-red-900">{compra.fornecedor || 'Sem fornecedor'}</p>
                            <p className="text-sm text-red-700">{compra.produto}</p>
                          </div>
                          <p className="font-bold text-red-700 text-lg">R$ {compra.valor_total.toFixed(2)}</p>
                        </div>
                        <div className="flex gap-2 text-xs text-red-600">
                          <Badge variant="secondary" className="bg-red-100">
                            {compra.quantidade} {compra.unidade_compra}
                          </Badge>
                          <Badge variant="secondary" className={compra.pago ? 'bg-green-200 text-green-800' : 'bg-orange-100 text-orange-800'}>
                            {compra.pago ? 'Pago' : 'Pendente'}
                          </Badge>
                        </div>
                        {compra.observacoes && (
                          <p className="text-xs text-gray-600 mt-2 italic">{compra.observacoes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Compras a Pagar */}
              {diasSelecionado.eventos.comprasPagar.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-red-600 flex items-center gap-2">
                    ↓ Compras a Pagar ({diasSelecionado.eventos.comprasPagar.length})
                  </h3>
                  <div className="space-y-2">
                    {diasSelecionado.eventos.comprasPagar.map((compra, idx) => (
                      <div key={idx} className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-red-900">{compra.fornecedor || 'Sem fornecedor'}</p>
                            <p className="text-sm text-red-700">{compra.produto}</p>
                            <p className="text-xs text-gray-600">Comprado em: {formatarDataBR(compra.data_compra)}</p>
                          </div>
                          <p className="font-bold text-red-700 text-lg">R$ {compra.valor_total.toFixed(2)}</p>
                        </div>
                        {compra.observacoes && (
                          <p className="text-xs text-gray-600 mt-2 italic">{compra.observacoes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}