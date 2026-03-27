import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { Save, X, Calendar, Package } from "lucide-react";

export default function FormCompra({ compra, produtos = [], onSubmit, onCancel }) {
  const [dados, setDados] = useState(compra || {
    produto: "",
    quantidade: "",
    unidade_compra: "",
    valor_por_unidade: "",
    valor_total: "",
    data_compra: "",
    data_pagamento: "",
    pago: false,
    data_pagamento_efetivo: "",
    fornecedor: "",
    observacoes: "",
    adicionar_estoque: false,
    produto_estoque_id: ""
  });

  const [sugestoesProdutos, setSugestoesProdutos] = useState([]);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);

  const calcularTotal = (qtd, valorUnitario) => {
    return (parseFloat(qtd) || 0) * (parseFloat(valorUnitario) || 0);
  };

  const handleQuantidadeChange = (value) => {
    const novosDados = { ...dados, quantidade: value };
    novosDados.valor_total = calcularTotal(value, dados.valor_por_unidade);
    setDados(novosDados);
  };

  const handleValorUnitarioChange = (value) => {
    const novosDados = { ...dados, valor_por_unidade: value };
    novosDados.valor_total = calcularTotal(dados.quantidade, value);
    setDados(novosDados);
  };

  const handleProdutoChange = (value) => {
    setDados({ ...dados, produto: value, produto_estoque_id: "" });
    
    if (value.trim().length > 0) {
      const sugestoesFiltradas = produtos.filter(p => 
        p.ativo && p.nome.toLowerCase().includes(value.toLowerCase())
      );
      setSugestoesProdutos(sugestoesFiltradas);
      setMostrarSugestoes(true);
    } else {
      setSugestoesProdutos([]);
      setMostrarSugestoes(false);
    }
  };

  const handleSelecionarProduto = (produto) => {
    setDados({
      ...dados,
      produto: produto.nome,
      produto_estoque_id: produto.id,
      unidade_compra: produto.unidade
    });
    setMostrarSugestoes(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...dados,
      quantidade: parseFloat(dados.quantidade),
      valor_por_unidade: parseFloat(dados.valor_por_unidade),
      valor_total: parseFloat(dados.valor_total)
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
            {compra ? 'Editar Compra' : 'Nova Compra'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              {/* Campo de Produto com Autocomplete */}
              <div className="relative">
                <Label htmlFor="produto" className="text-base">Produto</Label>
                <Input
                  id="produto"
                  value={dados.produto}
                  onChange={(e) => handleProdutoChange(e.target.value)}
                  onFocus={() => {
                    if (dados.produto && sugestoesProdutos.length > 0) {
                      setMostrarSugestoes(true);
                    }
                  }}
                  placeholder="Digite o nome do produto..."
                  required
                  className="h-12 text-base"
                  autoComplete="off"
                />
                
                {mostrarSugestoes && sugestoesProdutos.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {sugestoesProdutos.map((produto) => (
                      <div
                        key={produto.id}
                        onClick={() => handleSelecionarProduto(produto)}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{produto.nome}</div>
                        <div className="text-xs text-gray-500">
                          Estoque: {produto.estoque_atual} {produto.unidade}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Switch Adicionar ao Estoque - SEMPRE ATIVO */}
              <div className={`${dados.adicionar_estoque ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className={`w-5 h-5 ${dados.adicionar_estoque ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div>
                      <Label className="text-base font-semibold cursor-pointer" onClick={() => setDados({...dados, adicionar_estoque: !dados.adicionar_estoque})}>
                        Adicionar ao Estoque
                      </Label>
                      <p className="text-xs text-gray-600">
                        {dados.produto_estoque_id 
                          ? "Adicionar ao produto existente no estoque"
                          : "Criar produto no estoque e adicionar quantidade"}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={dados.adicionar_estoque}
                    onCheckedChange={(checked) => setDados({...dados, adicionar_estoque: checked})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="quantidade" className="text-base">Quantidade</Label>
                  <Input
                    id="quantidade"
                    type="number"
                    step="0.1"
                    value={dados.quantidade}
                    onChange={(e) => handleQuantidadeChange(e.target.value)}
                    placeholder="Ex: 19"
                    required
                    className="h-12 text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="unidade_compra" className="text-base">Unidade</Label>
                  <Select
                    value={dados.unidade_compra}
                    onValueChange={(value) => setDados({...dados, unidade_compra: value})}
                    disabled={dados.produto_estoque_id}
                  >
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Unidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="caixas">Caixas</SelectItem>
                      <SelectItem value="sacos">Sacos</SelectItem>
                      <SelectItem value="unidades">Unidades</SelectItem>
                      <SelectItem value="kg">Quilos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="valor_por_unidade" className="text-base">Valor por Unidade (R$)</Label>
                <Input
                  id="valor_por_unidade"
                  type="number"
                  step="0.01"
                  value={dados.valor_por_unidade}
                  onChange={(e) => handleValorUnitarioChange(e.target.value)}
                  placeholder="Ex: 25.50"
                  required
                  className="h-12 text-base"
                />
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <Label className="text-sm text-gray-600">Valor Total</Label>
                <div className="text-3xl font-bold text-green-600 mt-1">
                  R$ {(dados.valor_total || 0).toFixed(2)}
                </div>
                <p className="text-xs text-gray-500 mt-1">Calculado automaticamente</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="data_compra" className="text-base">Data da Compra</Label>
                  <Input
                    id="data_compra"
                    type="date"
                    value={dados.data_compra}
                    onChange={(e) => setDados({...dados, data_compra: e.target.value})}
                    required
                    className="h-12 text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="data_pagamento" className="text-base flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Data Pagamento
                  </Label>
                  <Input
                    id="data_pagamento"
                    type="date"
                    value={dados.data_pagamento}
                    onChange={(e) => setDados({...dados, data_pagamento: e.target.value})}
                    className="h-12 text-base"
                  />
                  <p className="text-xs text-gray-500 mt-1">Quando será pago</p>
                </div>
              </div>

              <div>
                <Label htmlFor="fornecedor" className="text-base">Fornecedor</Label>
                <Input
                  id="fornecedor"
                  value={dados.fornecedor}
                  onChange={(e) => setDados({...dados, fornecedor: e.target.value})}
                  placeholder="Nome do fornecedor"
                  className="h-12 text-base"
                />
              </div>

              <div>
                <Label htmlFor="observacoes" className="text-base">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={dados.observacoes}
                  onChange={(e) => setDados({...dados, observacoes: e.target.value})}
                  placeholder="Observações sobre a compra..."
                  className="h-24 text-base"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
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
                className="flex-1 h-12 text-base bg-green-600 hover:bg-green-700"
              >
                <Save className="w-5 h-5 mr-2" />
                {compra ? 'Atualizar' : 'Salvar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}