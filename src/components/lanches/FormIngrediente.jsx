import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Calculator } from "lucide-react";
import CalculadoraCorrecao from "./CalculadoraCorrecao";

const capitalizar = (texto) => {
  return texto
    .toLowerCase()
    .split(' ')
    .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
    .join(' ');
};

export default function FormIngrediente({ ingrediente, onSubmit, onCancel }) {
  const [dados, setDados] = useState(ingrediente || {
    nome: "",
    quantidade_comprada: "",
    valor_pago: "",
    estoque_atual: "",
    estoque_minimo: "",
    fator_correcao: 1,
    ativo: true
  });

  const [mostrarCalculadora, setMostrarCalculadora] = useState(false);

  // Converter e validar inputs numéricos - garantir conversão correta
  const converterParaNumero = (valor) => {
    if (!valor && valor !== 0) return 0;
    // Converter para string de forma segura
    let str = String(valor);

    // Normalizar TODOS os tipos de vírgulas e separadores possíveis
    // Incluindo vírgulas Unicode especiais que alguns teclados usam
    str = str
      .replace(/[\u002C\u060C\u066B\u3001\uFE10\uFE11\uFE50\uFE51\uFF0C\uFF64]/g, '.') // Todas as vírgulas unicode
      .replace(/[\u0027\u2018\u2019\u201A\u201B\u2032\u02B9\u02BC]/g, '') // Aspas/apóstrofos
      .replace(/[^\d.-]/g, ''); // Manter só números, ponto e menos

    if (!str) return 0;

    // Se tem mais de um ponto, manter só o último como decimal
    const pontos = str.match(/\./g);
    if (pontos && pontos.length > 1) {
      const partes = str.split('.');
      const decimal = partes.pop();
      str = partes.join('') + '.' + decimal;
    }

    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
  };

  const quantidadeComprada = converterParaNumero(dados.quantidade_comprada);
  const valorPago = converterParaNumero(dados.valor_pago);
  
  const precoPorKg = quantidadeComprada > 0 && valorPago > 0
    ? (valorPago / quantidadeComprada)
    : 0;

  const fatorCorrecao = converterParaNumero(dados.fator_correcao) || 1;
  const precoCorrigidoKg = precoPorKg * fatorCorrecao;

  const handleAplicarFator = (fator) => {
    setDados({...dados, fator_correcao: fator});
    setMostrarCalculadora(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Converter strings com vírgula para ponto (locale brasileiro)
    const estoqueAtualInput = dados.estoque_atual 
      ? converterParaNumero(dados.estoque_atual)
      : quantidadeComprada;
    
    const estoqueMinimo = dados.estoque_minimo
      ? converterParaNumero(dados.estoque_minimo)
      : 0;
    
    onSubmit({
      ...dados,
      quantidade_comprada: quantidadeComprada,
      valor_pago: valorPago,
      preco_por_kg: precoPorKg,
      fator_correcao: fatorCorrecao,
      preco_corrigido_kg: precoCorrigidoKg,
      estoque_atual: estoqueAtualInput,
      estoque_minimo: estoqueMinimo
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{ingrediente ? 'Editar' : 'Novo'} Ingrediente</CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label>Nome do Ingrediente *</Label>
                <Input
                  value={dados.nome}
                  onChange={(e) => setDados({...dados, nome: capitalizar(e.target.value)})}
                  placeholder="Ex: Farinha de Trigo"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Quantidade Comprada (kg) *</Label>
                  <Input
                    type="text"
                    inputMode="text"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                    value={dados.quantidade_comprada}
                    onChange={(e) => setDados({...dados, quantidade_comprada: e.target.value})}
                    placeholder="Ex: 2,5 ou 2.5"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Peso do pacote/saco que você comprou</p>
                  {dados.quantidade_comprada && (
                    <p className="text-xs text-blue-600 mt-1">Lido: {converterParaNumero(dados.quantidade_comprada)} kg</p>
                  )}
                </div>

                <div>
                  <Label>Valor Total Pago (R$) *</Label>
                  <Input
                    type="text"
                    inputMode="text"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                    value={dados.valor_pago}
                    onChange={(e) => setDados({...dados, valor_pago: e.target.value})}
                    placeholder="Ex: 53 ou 53,00"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Quanto pagou no total</p>
                  {dados.valor_pago && (
                    <p className="text-xs text-blue-600 mt-1">Lido: R$ {converterParaNumero(dados.valor_pago).toFixed(2)}</p>
                  )}
                </div>
              </div>

              {precoPorKg > 0 && (
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-900">Preço pago por kg:</span>
                      <span className="text-lg font-bold text-green-700">R$ {precoPorKg.toFixed(2)}/kg</span>
                    </div>

                    {fatorCorrecao > 1 && (
                      <>
                        <div className="flex items-center justify-between text-sm text-green-800 mb-1">
                          <span>Fator de correção:</span>
                          <span className="font-semibold">{fatorCorrecao.toFixed(2)}x</span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-green-300">
                          <span className="font-semibold text-green-900">Preço real (corrigido):</span>
                          <span className="text-xl font-bold text-green-900">R$ {precoCorrigidoKg.toFixed(2)}/kg</span>
                        </div>
                      </>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setMostrarCalculadora(!mostrarCalculadora)}
                    className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    {mostrarCalculadora ? 'Fechar' : 'Abrir'} Calculadora de Correção
                  </Button>
                </div>
              )}

              {mostrarCalculadora && precoPorKg > 0 && (
                <CalculadoraCorrecao 
                  precoBase={precoPorKg}
                  onAplicar={handleAplicarFator}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Estoque Atual (kg)</Label>
                  <Input
                    type="text"
                    value={dados.estoque_atual}
                    onChange={(e) => setDados({...dados, estoque_atual: e.target.value})}
                    placeholder="Padrão: quantidade comprada"
                  />
                  <p className="text-xs text-gray-500 mt-1">Deixe em branco para usar a quantidade comprada</p>
                </div>

                <div>
                  <Label>Estoque Mínimo (kg)</Label>
                  <Input
                    type="text"
                    value={dados.estoque_minimo}
                    onChange={(e) => setDados({...dados, estoque_minimo: e.target.value})}
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Alerta quando atingir este valor</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                {ingrediente ? 'Atualizar' : 'Salvar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}