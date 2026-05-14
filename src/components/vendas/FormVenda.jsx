import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { Save, X, Package, AlertTriangle, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function FormVenda({ venda, produtos = [], onSubmit, onCancel }) {
  const [dados, setDados] = useState(venda || {
    produto: "",
    produto_estoque_id: "",
    quantidade: "",
    unidade_venda: "kg",
    preco_por_unidade: "",
    valor_total: "",
    data_venda: "",
    data_pagamento: "",
    pago: false,
    data_pagamento_efetivo: "",
    cliente: "",
    descontar_estoque: true,
    observacoes: ""
  });

  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [modoManual, setModoManual] = useState(false);

  useEffect(() => {
    if (venda) {
      setModoManual(!venda.produto_estoque_id);
    }
  }, [venda]);

  useEffect(() => {
    if (dados.produto_estoque_id && produtos.length > 0) {
      const produto = produtos.find(p => p.id === dados.produto_estoque_id);
      setProdutoSelecionado(produto);
      
      if (produto) {
        setDados(prev => ({
          ...prev,
          produto: produto.nome,
          unidade_venda: produto.unidade === 'unidades' ? 'kg' : produto.unidade,
          descontar_estoque: produto.controla_estoque
        }));
      }
    }
  }, [dados.produto_estoque_id, produtos]);

  const calcularTotal = (quantidade, precoUnidade) => {
    return (parseFloat(quantidade) || 0) * (parseFloat(precoUnidade) || 0);
  };

  const handleQuantidadeChange = (value) => {
    const novosDados = { ...dados, quantidade: value };
    novosDados.valor_total = calcularTotal(value, dados.preco_por_unidade);
    setDados(novosDados);
  };

  const handlePrecoChange = (value) => {
    const novosDados = { ...dados, preco_por_unidade: value };
    novosDados.valor_total = calcularTotal(dados.quantidade, value);
    setDados(novosDados);
  };

  const handleProdutoEstoqueChange = (produtoId) => {
    if (produtoId === "manual") {
      setModoManual(true);
      setDados({
        ...dados,
        produto_estoque_id: "",
        produto: "",
        descontar_estoque: false
      });
      setProdutoSelecionado(null);
    } else {
      setModoManual(false);
      setDados({
        ...dados,
        produto_estoque_id: produtoId
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const quantidadeVal = parseFloat(dados.quantidade) || 0;
    const precoVal = parseFloat(dados.preco_por_unidade) || 0;
    const totalVal = parseFloat(dados.valor_total) || 0;
    const prodId = (modoManual || !dados.produto_estoque_id) ? undefined : dados.produto_estoque_id;

    onSubmit({
      cliente_nome: dados.cliente || "Consumidor",
      data_venda: dados.data_venda || new Date().toISOString().split('T')[0],
      valor_total: totalVal,
      pago: !!dados.pago,
      forma_pagamento: dados.forma_pagamento || "dinheiro",
      itens: [{
        produto_estoque_id: prodId,
        nome_produto: dados.produto || "Produto",
        quantidade: quantidadeVal,
        preco_unitario: precoVal,
        unidade: dados.unidade_venda || "unidades"
      }]
    });
  };

  const unidadeLabel = {
    kg: "Kg",
    sacos: "Sacos",
    caixas: "Caixas",
    lote: "Lote",
    unidades: "Un",
    litros: "L",
    pacotes: "Pct"
  };

  const estoqueInsuficiente = produtoSelecionado && 
    parseFloat(dados.quantidade || 0) > produtoSelecionado.estoque_atual;

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
            {venda ? 'Editar Venda' : 'Nova Venda'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              {!venda && (
                <div>
                  <Label htmlFor="produto_estoque" className="text-base flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Produto do Estoque
                  </Label>
                  <Select 
                    value={modoManual ? "manual" : dados.produto_estoque_id}
                    onValueChange={handleProdutoEstoqueChange}
                  >
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Selecione um produto ou digite manualmente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">
                        ✍️ Digitar produto manualmente
                      </SelectItem>
                      {produtos.length > 0 && (
                        <>
                          <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">
                            Produtos do Estoque
                          </div>
                          {produtos.map(produto => (
                            <SelectItem key={produto.id} value={produto.id}>
                              {produto.nome} - {produto.estoque_atual} {unidadeLabel[produto.unidade]}
                              {produto.controla_estoque && ' 🔄'}
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    {modoManual 
                      ? "Modo manual: o estoque não será atualizado" 
                      : "Produtos com 🔄 descontam automaticamente do estoque"}
                  </p>
                </div>
              )}

              {produtoSelecionado && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Package className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">
                        Estoque atual: {produtoSelecionado.estoque_atual} {unidadeLabel[produtoSelecionado.unidade]}
                      </p>
                      {produtoSelecionado.controla_estoque && (
                        <p className="text-xs text-blue-700 mt-1">
                          ✅ Este produto desconta automaticamente do estoque
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="produto" className="text-base">Produto</Label>
                <Input
                  id="produto"
                  value={dados.produto}
                  onChange={(e) => setDados({...dados, produto: e.target.value})}
                  placeholder="Ex: Tomate"
                  required
                  disabled={!modoManual && !!dados.produto_estoque_id}
                  className="h-12 text-base"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="quantidade" className="text-base">Quantidade</Label>
                  <Input
                    id="quantidade"
                    type="number"
                    step="0.1"
                    value={dados.quantidade}
                    onChange={(e) => handleQuantidadeChange(e.target.value)}
                    placeholder="Ex: 150"
                    required
                    className="h-12 text-base"
                  />
                  {estoqueInsuficiente && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Estoque insuficiente!
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="unidade_venda" className="text-base">Unidade</Label>
                  <Select 
                    value={dados.unidade_venda} 
                    onValueChange={(value) => setDados({...dados, unidade_venda: value})}
                    disabled={!modoManual && !!dados.produto_estoque_id}
                  >
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Unidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kg</SelectItem>
                      <SelectItem value="sacos">Sacos</SelectItem>
                      <SelectItem value="caixas">Caixas</SelectItem>
                      <SelectItem value="lote">Lote</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="preco_por_unidade" className="text-base">
                    Preço/{unidadeLabel[dados.unidade_venda]}
                  </Label>
                  <Input
                    id="preco_por_unidade"
                    type="number"
                    step="0.01"
                    value={dados.preco_por_unidade}
                    onChange={(e) => handlePrecoChange(e.target.value)}
                    placeholder="Ex: 5.50"
                    required
                    className="h-12 text-base"
                  />
                </div>
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
                  <Label htmlFor="data_venda" className="text-base">Data da Venda</Label>
                  <Input
                    id="data_venda"
                    type="date"
                    value={dados.data_venda}
                    onChange={(e) => setDados({...dados, data_venda: e.target.value})}
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
                <Label htmlFor="cliente" className="text-base">Cliente</Label>
                <Input
                  id="cliente"
                  value={dados.cliente}
                  onChange={(e) => setDados({...dados, cliente: e.target.value})}
                  placeholder="Nome do cliente"
                  className="h-12 text-base"
                />
              </div>

              {produtoSelecionado && produtoSelecionado.controla_estoque && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <div className="flex-1">
                    <Label htmlFor="descontar_estoque" className="text-base font-medium">
                      Descontar do Estoque
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      Ao salvar, será descontado {dados.quantidade || 0} {unidadeLabel[dados.unidade_venda]} do estoque
                    </p>
                  </div>
                  <Switch
                    id="descontar_estoque"
                    checked={dados.descontar_estoque}
                    onCheckedChange={(checked) => setDados({...dados, descontar_estoque: checked})}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="observacoes" className="text-base">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={dados.observacoes}
                  onChange={(e) => setDados({...dados, observacoes: e.target.value})}
                  placeholder="Observações sobre a venda..."
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
                disabled={estoqueInsuficiente}
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