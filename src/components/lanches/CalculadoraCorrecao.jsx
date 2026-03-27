import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";

export default function CalculadoraCorrecao({ onAplicar, precoBase }) {
  const [pesoComprado, setPesoComprado] = useState("");
  const [pesoDepoisPreparo, setPesoDepoisPreparo] = useState("");

  const fatorCorrecao = pesoComprado && pesoDepoisPreparo 
    ? (parseFloat(pesoComprado) / parseFloat(pesoDepoisPreparo)) 
    : 0;

  const precoCorrigido = precoBase && fatorCorrecao 
    ? precoBase * fatorCorrecao 
    : 0;

  const handleAplicar = () => {
    if (fatorCorrecao > 0) {
      onAplicar(fatorCorrecao);
    }
  };

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Calculadora de Fator de Correção
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white p-3 rounded border border-blue-100">
          <p className="text-sm text-gray-700 mb-2">
            <strong>💡 O que é?</strong> Muitos ingredientes perdem peso após preparo/cozimento. 
            O fator de correção ajusta o preço real.
          </p>
          <p className="text-xs text-gray-600">
            <strong>Exemplo:</strong> Comprou 2kg de frango por R$ 33,80. Após cozinhar ficou 1,4kg. 
            Fator = 2 ÷ 1,4 = 1,43. Preço real = R$ 16,90 × 1,43 = R$ 24,17/kg
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Peso Comprado (kg)</Label>
            <Input
              type="number"
              step="0.001"
              value={pesoComprado}
              onChange={(e) => setPesoComprado(e.target.value)}
              placeholder="Ex: 2.0"
            />
          </div>

          <div>
            <Label>Peso Após Preparo (kg)</Label>
            <Input
              type="number"
              step="0.001"
              value={pesoDepoisPreparo}
              onChange={(e) => setPesoDepoisPreparo(e.target.value)}
              placeholder="Ex: 1.4"
            />
          </div>
        </div>

        {fatorCorrecao > 0 && (
          <div className="space-y-3">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-yellow-900">Fator de Correção:</span>
                <span className="text-xl font-bold text-yellow-900">{fatorCorrecao.toFixed(2)}</span>
              </div>
              
              {precoBase > 0 && (
                <>
                  <div className="flex justify-between items-center text-sm text-yellow-800 mb-1">
                    <span>Preço pago por kg:</span>
                    <span>R$ {precoBase.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-yellow-300">
                    <span className="font-semibold text-yellow-900">Preço real por kg:</span>
                    <span className="text-lg font-bold text-yellow-900">R$ {precoCorrigido.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            <Button 
              onClick={handleAplicar}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Aplicar Fator de Correção
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}