import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function CalendarioPagamentos({ vendas, onClickParcela }) {
  const [mesAtual, setMesAtual] = useState(new Date());

  const inicioMes = startOfMonth(mesAtual);
  const fimMes = endOfMonth(mesAtual);
  const diasDoMes = eachDayOfInterval({ start: inicioMes, end: fimMes });

  // Adicionar dias vazios no início para alinhar com o dia da semana
  const primeiroDiaSemana = getDay(inicioMes);
  const diasVazios = Array(primeiroDiaSemana).fill(null);

  // Gerar todas as parcelas previstas para o mês atual
  const parcelasPorDia = {};

  vendas.forEach(venda => {
    if (venda.status === 'cancelada') return;

    for (let i = venda.parcelas_pagas; i < venda.numero_parcelas; i++) {
      const dataParcela = addMonths(new Date(venda.data_primeira_parcela), i);
      
      if (isSameMonth(dataParcela, mesAtual)) {
        const diaKey = format(dataParcela, 'yyyy-MM-dd');
        if (!parcelasPorDia[diaKey]) {
          parcelasPorDia[diaKey] = [];
        }
        parcelasPorDia[diaKey].push({
          ...venda,
          numeroParcela: i + 1,
          valorParcela: venda.valor_parcela,
          paga: i < venda.parcelas_pagas
        });
      }
    }
  });

  const mesAnterior = () => setMesAtual(subMonths(mesAtual, 1));
  const proximoMes = () => setMesAtual(addMonths(mesAtual, 1));

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <CalendarIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Calendário de Pagamentos</span>
            <span className="sm:hidden">Pagamentos</span>
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
          
          {/* Dias vazios antes do primeiro dia do mês */}
          {diasVazios.map((_, idx) => (
            <div key={`vazio-${idx}`} className="min-h-[60px] md:min-h-[100px]"></div>
          ))}

          {diasDoMes.map(dia => {
            const diaKey = format(dia, 'yyyy-MM-dd');
            const parcelas = parcelasPorDia[diaKey] || [];
            const hoje = isSameDay(dia, new Date());

            return (
              <div
                key={diaKey}
                className={`min-h-[60px] md:min-h-[100px] p-1 md:p-2 border rounded-lg ${
                  hoje ? 'bg-blue-50 border-blue-300' : 'bg-white'
                }`}
              >
                <div className={`text-xs md:text-sm font-medium mb-1 ${hoje ? 'text-blue-600' : ''}`}>
                  {format(dia, 'd')}
                </div>
                <div className="space-y-1">
                  {parcelas.slice(0, 2).map((parcela, idx) => (
                    <button
                      key={idx}
                      onClick={() => onClickParcela && onClickParcela(parcela)}
                      className={`w-full text-left text-[10px] md:text-xs p-0.5 md:p-1 rounded transition-all hover:shadow-md hover:scale-105 cursor-pointer ${
                        parcela.paga
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                      }`}
                    >
                      <div className="font-medium truncate">{parcela.cliente}</div>
                      <div className="hidden md:block truncate text-[9px] md:text-[10px]">{parcela.empresa_nome}</div>
                      <div className="font-semibold">R$ {parcela.valorParcela.toFixed(0)}</div>
                    </button>
                  ))}
                  {parcelas.length > 2 && (
                    <button
                      onClick={() => parcelas.length > 0 && onClickParcela && onClickParcela(parcelas[2])}
                      className="text-[10px] text-center text-gray-500 hover:text-gray-700 w-full cursor-pointer"
                    >
                      +{parcelas.length - 2}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 md:mt-6 flex flex-wrap gap-3 md:gap-4 text-xs md:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 md:w-4 md:h-4 bg-purple-100 rounded"></div>
            <span>A receber</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 md:w-4 md:h-4 bg-green-100 rounded"></div>
            <span>Pago</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 md:w-4 md:h-4 bg-blue-50 border-2 border-blue-300 rounded"></div>
            <span>Hoje</span>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          💡 Clique em um cliente para ver detalhes da venda
        </p>
      </CardContent>
    </Card>
  );
}