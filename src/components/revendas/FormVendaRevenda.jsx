import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
import { Save, X, ShoppingBag, AlertTriangle } from "lucide-react";

export default function FormVendaRevenda({ venda, empresas, onSubmit, onCancel }) {
  const [dados, setDados] = useState(venda || {
    cliente: "",
    empresa_id: "",
    empresa_nome: "",
    valor_total: "",
    numero_parcelas: "1",
    valor_parcela: "",
    data_primeira_parcela: "",
    porcentagem_comissao: "",
    valor_comissao_total: "",
    produto: "",
    observacoes: ""
  });

  const [erro, setErro] = useState("");

  const calcularValores = (valorTotal, numParcelas, porcentagem) => {
    const total = parseFloat(valorTotal) || 0;
    const parcelas = parseInt(numParcelas) || 1;
    const comissao = parseFloat(porcentagem) || 0;

    const valorComissao = ((total * comissao) / 100);
    
    // Validação: comissão não pode exceder o valor total
    if (valorComissao > total) {
      setErro(`A comissão de ${comissao}% (R$ ${valorComissao.toFixed(2)}) não pode ser maior que o valor total da venda (R$ ${total.toFixed(2)})`);
    } else {
      setErro("");
    }

    return {
      valor_parcela: (total / parcelas).toFixed(2),
      valor_comissao_total: valorComissao.toFixed(2)
    };
  };

  const handleEmpresaChange = (empresaId) => {
    const empresa = empresas.find(e => e.id === empresaId);
    if (empresa) {
      const novosValores = calcularValores(
        dados.valor_total,
        dados.numero_parcelas,
        empresa.porcentagem_comissao
      );
      setDados({
        ...dados,
        empresa_id: empresaId,
        empresa_nome: empresa.nome,
        porcentagem_comissao: empresa.porcentagem_comissao,
        ...novosValores
      });
    }
  };

  const handleValorChange = (valor) => {
    const novosValores = calcularValores(
      valor,
      dados.numero_parcelas,
      dados.porcentagem_comissao
    );
    setDados({
      ...dados,
      valor_total: valor,
      ...novosValores
    });
  };

  const handleParcelasChange = (parcelas) => {
    const novosValores = calcularValores(
      dados.valor_total,
      parcelas,
      dados.porcentagem_comissao
    );
    setDados({
      ...dados,
      numero_parcelas: parcelas,
      ...novosValores
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validação final antes de submeter
    const valorTotal = parseFloat(dados.valor_total);
    const valorComissao = parseFloat(dados.valor_comissao_total);
    
    if (valorComissao > valorTotal) {
      setErro(`A comissão (R$ ${valorComissao.toFixed(2)}) não pode ser maior que o valor total da venda (R$ ${valorTotal.toFixed(2)})`);
      return;
    }

    onSubmit({
      ...dados,
      valor_total: valorTotal,
      numero_parcelas: parseInt(dados.numero_parcelas),
      valor_parcela: parseFloat(dados.valor_parcela),
      porcentagem_comissao: parseFloat(dados.porcentagem_comissao),
      valor_comissao_total: valorComissao,
      parcelas_pagas: 0,
      status: 'ativa'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-6"
    >
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShoppingBag className="w-5 h-5" />
            {venda ? 'Editar Venda' : 'Nova Venda'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {erro && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{erro}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="cliente" className="text-base">Nome do Cliente</Label>
                <Input
                  id="cliente"
                  value={dados.cliente}
                  onChange={(e) => setDados({...dados, cliente: e.target.value})}
                  placeholder="Ex: Maria Silva"
                  required
                  className="h-12 text-base"
                />
              </div>

              <div>
                <Label htmlFor="empresa_id" className="text-base">Empresa</Label>
                <Select
                  value={dados.empresa_id}
                  onValueChange={handleEmpresaChange}
                >
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {empresas.filter(e => e.ativa).map((empresa) => (
                      <SelectItem key={empresa.id} value={empresa.id}>
                        {empresa.nome} ({empresa.porcentagem_comissao}% comissão)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="produto" className="text-base">Produto(s) Vendido(s)</Label>
                <Textarea
                  id="produto"
                  value={dados.produto}
                  onChange={(e) => setDados({...dados, produto: e.target.value})}
                  placeholder="Ex: Kit Perfume + Creme Natura, Batom Boticário..."
                  className="h-20 text-base"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Descreva os produtos vendidos nesta venda
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="valor_total" className="text-base">Valor Total (R$)</Label>
                  <Input
                    id="valor_total"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={dados.valor_total}
                    onChange={(e) => handleValorChange(e.target.value)}
                    placeholder="Ex: 500.00"
                    required
                    className="h-12 text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="numero_parcelas" className="text-base">Número de Parcelas</Label>
                  <Input
                    id="numero_parcelas"
                    type="number"
                    min="1"
                    max="60"
                    value={dados.numero_parcelas}
                    onChange={(e) => handleParcelasChange(e.target.value)}
                    required
                    className="h-12 text-base"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="data_primeira_parcela" className="text-base">Data da 1ª Parcela</Label>
                <Input
                  id="data_primeira_parcela"
                  type="date"
                  value={dados.data_primeira_parcela}
                  onChange={(e) => setDados({...dados, data_primeira_parcela: e.target.value})}
                  required
                  className="h-12 text-base"
                />
                <p className="text-xs text-gray-500 mt-1">
                  As demais parcelas seguirão mensalmente
                </p>
              </div>

              {dados.valor_parcela && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <Label className="text-sm text-gray-600">Valor por Parcela</Label>
                    <div className="text-xl md:text-2xl font-bold text-blue-600 mt-1">
                      R$ {dados.valor_parcela}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {dados.numero_parcelas}x de R$ {dados.valor_parcela}
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg border ${
                    erro ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                  }`}>
                    <Label className="text-sm text-gray-600">Sua Comissão Total</Label>
                    <div className={`text-xl md:text-2xl font-bold mt-1 ${
                      erro ? 'text-red-600' : 'text-green-600'
                    }`}>
                      R$ {dados.valor_comissao_total}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {dados.porcentagem_comissao}% do valor total
                    </p>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="observacoes" className="text-base">Observações (Opcional)</Label>
                <Textarea
                  id="observacoes"
                  value={dados.observacoes}
                  onChange={(e) => setDados({...dados, observacoes: e.target.value})}
                  placeholder="Informações adicionais sobre a venda..."
                  className="h-20 text-base"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                className="flex-1 h-12 text-base"
              >
                <X className="w-5 h-5 mr-2" />
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={!!erro}
                className="flex-1 h-12 text-base bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5 mr-2" />
                {venda ? 'Atualizar' : 'Salvar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}