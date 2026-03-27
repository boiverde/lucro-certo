import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, X, Calendar, DollarSign } from "lucide-react";
import { format, addMonths, differenceInDays, isToday, isTomorrow, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

export default function LembretePagamentos({ vendas }) {
  const [lembretes, setLembretes] = useState([]);
  const [mostrarLembretes, setMostrarLembretes] = useState(true);
  const [lembretesDispensados, setLembretesDispensados] = useState([]);

  useEffect(() => {
    const hoje = new Date();
    const proximasParcelas = [];

    vendas.forEach(venda => {
      if (venda.status !== 'ativa') return;

      const proximaParcelaNumero = venda.parcelas_pagas + 1;
      const dataProximaParcela = addMonths(
        new Date(venda.data_primeira_parcela),
        venda.parcelas_pagas
      );

      const diasAteVencimento = differenceInDays(dataProximaParcela, hoje);

      // Mostrar lembretes para parcelas vencidas, hoje, amanhã e nos próximos 3 dias
      if (diasAteVencimento <= 3) {
        proximasParcelas.push({
          ...venda,
          dataProximaParcela,
          diasAteVencimento,
          numeroProximaParcela: proximaParcelaNumero
        });
      }
    });

    // Ordenar por data (mais urgente primeiro)
    proximasParcelas.sort((a, b) => a.diasAteVencimento - b.diasAteVencimento);

    setLembretes(proximasParcelas);
  }, [vendas]);

  const getLembreteTipo = (dias) => {
    if (dias < 0) return { label: 'Vencida', color: 'bg-red-500', textColor: 'text-red-700' };
    if (dias === 0) return { label: 'Hoje', color: 'bg-orange-500', textColor: 'text-orange-700' };
    if (dias === 1) return { label: 'Amanhã', color: 'bg-yellow-500', textColor: 'text-yellow-700' };
    return { label: `${dias} dias`, color: 'bg-blue-500', textColor: 'text-blue-700' };
  };

  const dispensarLembrete = (lembreteId) => {
    setLembretesDispensados([...lembretesDispensados, lembreteId]);
  };

  const lembretesVisiveis = lembretes.filter(l => !lembretesDispensados.includes(l.id));

  if (!mostrarLembretes || lembretesVisiveis.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-6"
      >
        <Card className="border-orange-200 bg-orange-50 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="w-5 h-5 text-orange-600 animate-pulse" />
                Lembretes de Pagamento
                <Badge variant="secondary" className="ml-2">
                  {lembretesVisiveis.length}
                </Badge>
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMostrarLembretes(false)}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lembretesVisiveis.map((lembrete) => {
                const tipo = getLembreteTipo(lembrete.diasAteVencimento);

                return (
                  <motion.div
                    key={lembrete.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-white rounded-lg p-4 border-l-4 border-orange-500 shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`${tipo.color} text-white`}>
                            {tipo.label}
                          </Badge>
                          <Badge variant="outline">{lembrete.empresa_nome}</Badge>
                        </div>
                        
                        <p className="font-bold text-lg mb-1">{lembrete.cliente}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-600">
                              {format(lembrete.dataProximaParcela, "d 'de' MMM", { locale: ptBR })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-600">
                              R$ {lembrete.valor_parcela.toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">
                              Parcela {lembrete.numeroProximaParcela}/{lembrete.numero_parcelas}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => dispensarLembrete(lembrete.id)}
                        className="ml-2"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}