import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, TrendingUp } from "lucide-react";

export default function CalculadoraMarkup({ 
  faturamento, 
  custoFixo, 
  taxaImpostos, 
  taxaCartao, 
  margemLucro
}) {
  // Custo fixo em %
  const custoFixoPct = (!faturamento || faturamento === 0) ? 0 : (custoFixo / faturamento) * 100;
  
  // Taxas e Margem em decimal (ex: 0.15)
  const taxaImpostoDec = parseFloat(taxaImpostos || 0) / 100;
  const taxaCartaoDec = parseFloat(taxaCartao || 0) / 100;
  const custoFixoDec = custoFixoPct / 100;
  const margemDec = parseFloat(margemLucro || 0) / 100;
  
  // Divisor = 1 - (Custo Fixo% + Impostos% + Taxas% + Margem%)
  const custosTotaisMargem = custoFixoDec + taxaImpostoDec + taxaCartaoDec + margemDec;
  const divisor = 1 - custosTotaisMargem;
  
  // Validação: Se a soma das taxas e lucro for >= 100%, o cálculo é impossível (prejuízo garantido)
  const markup = (divisor <= 0) ? 0 : (1 / divisor);
  const custosTotaisPct = (custoFixoDec + taxaImpostoDec + taxaCartaoDec) * 100;

  const custoFixoPercent = custoFixoPct;

  return (
    <Card className="shadow-lg bg-gradient-to-br from-green-50 to-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-green-600" />
          Calculadora de Markup (Método Avançado)
        </CardTitle>
        <p className="text-xs text-gray-600 mt-2">
          Cálculo baseado em custos fixos e variáveis para precificação profissional
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resumo dos custos */}
        <div className="bg-white rounded-lg p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Custo Fixo:</span>
            <span className="font-semibold">{custoFixoPercent.toFixed(2)}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Impostos:</span>
            <span className="font-semibold">{taxaImpostos}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Taxas (cartão/delivery):</span>
            <span className="font-semibold">{taxaCartao}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Margem de Lucro Desejada:</span>
            <span className="font-semibold">{margemLucro}%</span>
          </div>
          <div className="pt-3 border-t border-gray-200">
            <div className="flex justify-between">
              <span className="font-medium">Custos Totais:</span>
              <span className="font-bold text-orange-600">{custosTotaisPct.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        {/* Resultado do Markup */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white text-center">
          <p className="text-sm opacity-90 mb-1">Seu Número Mágico</p>
          <div className="text-5xl font-bold mb-2">{markup.toFixed(2)}</div>
          <p className="text-sm opacity-90">Markup Divisor</p>
        </div>

        {/* Exemplo de uso */}
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Como usar:
          </p>
          <p className="text-sm text-blue-800">
            <strong>Preço de Venda = Custo do Produto × {markup.toFixed(2)}</strong>
          </p>
          <p className="text-xs text-blue-700 mt-2">
            Exemplo: Produto com custo R$ 10,00<br />
            Preço de Venda = R$ 10,00 × {markup.toFixed(2)} = R$ {(10 * markup).toFixed(2)}
          </p>
        </div>

        {/* CMV Comparativo */}
        <div className="bg-purple-50 rounded-lg p-3 text-xs">
          <p className="font-semibold text-purple-900 mb-2">📊 Comparativo CMV (Custo da Mercadoria Vendida)</p>
          <div className="space-y-1 text-purple-800">
            <p>• Hamburgueria: CMV ideal 30-35%</p>
            <p>• Pizzaria: CMV ideal 25-30%</p>
            <p>• Lanchonete Salgados: CMV ideal 23-28%</p>
            <p>• Cafeteria: CMV ideal 20-25%</p>
          </div>
          <p className="mt-2 text-purple-700 font-medium">
            Seu CMV atual: {custoFixoPercent.toFixed(1)}% (fixo) + variáveis
          </p>
        </div>

        {/* Fórmula */}
        <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
          <p className="font-semibold mb-1">Fórmula do Markup:</p>
          <p className="font-mono">
            Markup = 1 ÷ (1 - {custosTotaisMargem.toFixed(2)})
          </p>
          <p className="font-mono mt-1">
            Markup = 1 ÷ {divisor.toFixed(2)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}