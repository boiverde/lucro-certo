import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package, TrendingDown, ExternalLink, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function PainelEstoque({ stats }) {
  if (!stats) return null;

  const { produtosBaixos = [], produtosZerados = [], ingredientesBaixos = [], totalProdutos = 0, totalIngredientes = 0 } = stats;
  const totalAlertas = produtosBaixos.length + produtosZerados.length + ingredientesBaixos.length;

  if (totalAlertas === 0 && totalProdutos === 0 && totalIngredientes === 0) {
    return null;
  }

  return (
    <Card className="shadow-lg border-l-4 border-orange-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-orange-600" />
            <CardTitle className="text-lg">Gestão de Estoque</CardTitle>
          </div>
          <Link to={createPageUrl("Controle")}>
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              Ver Estoque
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resumo de Alertas */}
        {totalAlertas > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-orange-900 mb-2">
                  {totalAlertas} Alerta{totalAlertas !== 1 ? 's' : ''} de Estoque
                </h4>
                {produtosZerados.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-red-800 mb-1">
                      🚨 {produtosZerados.length} Produto{produtosZerados.length !== 1 ? 's' : ''} Zerado{produtosZerados.length !== 1 ? 's' : ''}
                    </p>
                    <div className="space-y-1">
                      {produtosZerados.slice(0, 3).map(p => (
                        <div key={p.id} className="text-xs text-red-700 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {p.nome}
                        </div>
                      ))}
                      {produtosZerados.length > 3 && (
                        <p className="text-xs text-red-700">+ {produtosZerados.length - 3} outros</p>
                      )}
                    </div>
                  </div>
                )}
                {produtosBaixos.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-orange-800 mb-1">
                      ⚠️ {produtosBaixos.length} Produto{produtosBaixos.length !== 1 ? 's' : ''} com Estoque Baixo
                    </p>
                    <div className="space-y-1">
                      {produtosBaixos.slice(0, 3).map(p => (
                        <div key={p.id} className="text-xs text-orange-700 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <TrendingDown className="w-3 h-3" />
                            {p.nome}
                          </span>
                          <span className="font-medium">
                            {p.estoque_atual} {p.unidade}
                          </span>
                        </div>
                      ))}
                      {produtosBaixos.length > 3 && (
                        <p className="text-xs text-orange-700">+ {produtosBaixos.length - 3} outros</p>
                      )}
                    </div>
                  </div>
                )}
                {ingredientesBaixos.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-orange-800 mb-1">
                      ⚠️ {ingredientesBaixos.length} Ingrediente{ingredientesBaixos.length !== 1 ? 's' : ''} com Estoque Baixo
                    </p>
                    <div className="space-y-1">
                      {ingredientesBaixos.slice(0, 3).map(i => (
                        <div key={i.id} className="text-xs text-orange-700 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <TrendingDown className="w-3 h-3" />
                            {i.nome}
                          </span>
                          <span className="font-medium">
                            {i.estoque_atual.toFixed(2)} kg
                          </span>
                        </div>
                      ))}
                      {ingredientesBaixos.length > 3 && (
                        <p className="text-xs text-orange-700">+ {ingredientesBaixos.length - 3} outros</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Status Geral do Estoque */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-blue-600 font-medium mb-1">Produtos Ativos</p>
            <p className="text-2xl font-bold text-blue-900">
              {totalProdutos}
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <p className="text-xs text-purple-600 font-medium mb-1">Ingredientes</p>
            <p className="text-2xl font-bold text-purple-900">
              {totalIngredientes}
            </p>
          </div>
        </div>

        {totalAlertas === 0 && (totalProdutos > 0 || totalIngredientes > 0) && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-sm text-green-800 font-medium">
              ✓ Todos os estoques estão em níveis adequados
            </p>
          </div>
        )}

        {/* Ações Rápidas */}
        <div className="flex gap-2 pt-2">
          <Link to={createPageUrl("Controle")} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              Ver Movimentações
            </Button>
          </Link>
          <Link to={createPageUrl("Controle")} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              Ingredientes
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}