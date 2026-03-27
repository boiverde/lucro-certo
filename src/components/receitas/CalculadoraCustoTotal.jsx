import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, Clock, Briefcase, Settings } from "lucide-react";

/**
 * Calcula o custo total de uma receita incluindo:
 * - Custo de ingredientes
 * - Custo de mão de obra (baseado em tempo de preparo e custo por hora)
 * - Custo fixo por unidade (overhead)
 */
export default function CalculadoraCustoTotal({ 
  custoIngredientes, 
  tempoPreparo = 0, 
  custoMaoObraHora = 0,
  custoFixoUnidade = 0,
  mostrarDetalhes = true 
}) {
  const tempoPreparoHoras = tempoPreparo / 60;
  const custoMaoObra = tempoPreparoHoras * custoMaoObraHora;
  const custoTotal = custoIngredientes + custoMaoObra + custoFixoUnidade;

  if (!mostrarDetalhes) {
    return (
      <div className="text-lg font-bold text-blue-900">
        R$ {custoTotal.toFixed(2)}
      </div>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Calculator className="w-4 h-4 text-blue-600" />
          Custo Total Real
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Custo de Ingredientes */}
        <div className="flex justify-between items-center p-2 bg-white rounded">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50">
              Ingredientes
            </Badge>
          </div>
          <span className="font-semibold text-green-700">
            R$ {custoIngredientes.toFixed(2)}
          </span>
        </div>

        {/* Custo de Mão de Obra */}
        {tempoPreparo > 0 && custoMaoObraHora > 0 && (
          <div className="flex justify-between items-center p-2 bg-white rounded">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-orange-50">
                <Clock className="w-3 h-3 mr-1" />
                Mão de Obra
              </Badge>
              <span className="text-xs text-gray-500">
                ({tempoPreparo} min)
              </span>
            </div>
            <span className="font-semibold text-orange-700">
              R$ {custoMaoObra.toFixed(2)}
            </span>
          </div>
        )}

        {/* Custo Fixo/Overhead */}
        {custoFixoUnidade > 0 && (
          <div className="flex justify-between items-center p-2 bg-white rounded">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-purple-50">
                <Settings className="w-3 h-3 mr-1" />
                Overhead
              </Badge>
            </div>
            <span className="font-semibold text-purple-700">
              R$ {custoFixoUnidade.toFixed(2)}
            </span>
          </div>
        )}

        {/* Total */}
        <div className="pt-2 border-t-2 border-blue-200">
          <div className="flex justify-between items-center">
            <span className="font-bold text-blue-900">CUSTO TOTAL</span>
            <span className="text-xl font-bold text-blue-900">
              R$ {custoTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Alertas */}
        {tempoPreparo > 0 && custoMaoObraHora === 0 && (
          <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
            ⚠️ Configure o custo de mão de obra para cálculo preciso
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Hook para calcular custo total
 */
export function useCustoTotal(custoIngredientes, tempoPreparo, configuracoes) {
  const tempoPreparoHoras = (tempoPreparo || 0) / 60;
  const custoMaoObraHora = configuracoes?.custo_mao_obra_hora || 0;
  const custoFixoUnidade = configuracoes?.custo_fixo_por_unidade || 0;
  
  const custoMaoObra = tempoPreparoHoras * custoMaoObraHora;
  const custoTotal = custoIngredientes + custoMaoObra + custoFixoUnidade;

  return {
    custoIngredientes,
    custoMaoObra,
    custoFixoUnidade,
    custoTotal,
    detalhes: {
      tempoPreparoHoras,
      custoMaoObraHora,
      percentualIngredientes: custoTotal > 0 ? (custoIngredientes / custoTotal * 100) : 0,
      percentualMaoObra: custoTotal > 0 ? (custoMaoObra / custoTotal * 100) : 0,
      percentualOverhead: custoTotal > 0 ? (custoFixoUnidade / custoTotal * 100) : 0
    }
  };
}