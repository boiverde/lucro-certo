import React, { useState } from "react";
import { toast } from 'sonner';
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Trash2, ShoppingBag, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function FormPedido({ receitas, produtos, ingredientes, onSubmit, onCancel }) {
  const [dados, setDados] = useState({
    cliente: "",
    data_pedido: new Date().toISOString(),
    itens: [],
    desconto: 0,
    forma_pagamento: "dinheiro",
    status: "pendente",
    observacoes: ""
  });

  const [tipoItem, setTipoItem] = useState("receita");
  const [itemSelecionado, setItemSelecionado] = useState("");
  const [quantidade, setQuantidade] = useState("1");
  const [valorUnitario, setValorUnitario] = useState("");

  const produtosAtivos = produtos.filter(p => p.ativo && p.controla_estoque);
  const receitasAtivas = receitas.filter(r => r.ativo);

  const adicionarItem = () => {
    if (!itemSelecionado || !quantidade || !valorUnitario) return;

    const qtd = parseFloat(quantidade);
    const valor = parseFloat(valorUnitario);

    let item;
    if (tipoItem === "receita") {
      const receita = receitasAtivas.find(r => r.id === itemSelecionado);
      if (!receita) return;

      item = {
        tipo: "receita",
        id_referencia: receita.id,
        nome: receita.nome_produto,
        quantidade: qtd,
        valor_unitario: valor,
        valor_total: qtd * valor
      };
    } else {
      const produto = produtosAtivos.find(p => p.id === itemSelecionado);
      if (!produto) return;

      item = {
        tipo: "produto",
        id_referencia: produto.id,
        nome: produto.nome,
        quantidade: qtd,
        valor_unitario: valor,
        valor_total: qtd * valor
      };
    }

    setDados({
      ...dados,
      itens: [...dados.itens, item]
    });

    setItemSelecionado("");
    setQuantidade("1");
    setValorUnitario("");
  };

  const removerItem = (index) => {
    setDados({
      ...dados,
      itens: dados.itens.filter((_, i) => i !== index)
    });
  };

  const converterParaKg = (quantidade, unidade) => {
    switch(unidade) {
      case 'g':
      case 'gramas': 
        return quantidade / 1000;
      case 'ml': 
        return quantidade / 1000;
      case 'l':
      case 'litros': 
        return quantidade;
      case 'kg': 
        return quantidade;
      default: 
        return quantidade;
    }
  };

  const verificarEstoque = () => {
    const problemas = [];

    dados.itens.forEach(item => {
      if (item.tipo === "produto") {
        const produto = produtos.find(p => p.id === item.id_referencia);
        if (produto && produto.estoque_atual < item.quantidade) {
          problemas.push(`${item.nome}: estoque insuficiente (disponível: ${produto.estoque_atual} ${produto.unidade})`);
        }
      } else if (item.tipo === "receita") {
        const receita = receitas.find(r => r.id === item.id_referencia);
        if (receita) {
          receita.ingredientes?.forEach(ingredienteReceita => {
            const ing = ingredientes.find(i => i.id === ingredienteReceita.ingrediente_id);
            if (ing) {
              let qtdNecessaria;
              if (ingredienteReceita.quantidade_kg) {
                qtdNecessaria = ingredienteReceita.quantidade_kg * item.quantidade;
              } else {
                const qtdConvertida = converterParaKg(ingredienteReceita.quantidade, ingredienteReceita.unidade || 'kg');
                qtdNecessaria = qtdConvertida * item.quantidade;
              }
              
              if (ing.estoque_atual < qtdNecessaria) {
                problemas.push(`${item.nome} - ${ing.nome}: estoque insuficiente (necessário: ${qtdNecessaria.toFixed(3)} kg, disponível: ${ing.estoque_atual.toFixed(3)} kg)`);
              }
            }
          });
        }
      }
    });

    return problemas;
  };

  const estoqueProblemas = verificarEstoque();

  const valorTotal = dados.itens.reduce((sum, item) => sum + item.valor_total, 0);
  const valorFinal = valorTotal - (parseFloat(dados.desconto) || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (dados.itens.length === 0) {
      toast.warning('Adicione pelo menos um item ao pedido', { id: 'Adicione pelo menos um item ao pedido' })
      return;
    }

    if (estoqueProblemas.length > 0) {
      toast.warning('Não é possível finalizar o pedido devido a problemas de estoque', { id: 'Não é possível finalizar o pedido devido a problemas de estoque' })
      return;
    }

    const numeroPedido = `PED${Date.now()}`;

    onSubmit({
      ...dados,
      numero_pedido: numeroPedido,
      valor_total: valorTotal,
      valor_final: valorFinal,
      desconto: parseFloat(dados.desconto) || 0
    });
  };

  const itemAtual = itemSelecionado ? 
    (tipoItem === "receita" 
      ? receitasAtivas.find(r => r.id === itemSelecionado)
      : produtosAtivos.find(p => p.id === itemSelecionado)
    ) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Novo Pedido</CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label>Cliente</Label>
              <Input
                value={dados.cliente}
                onChange={(e) => setDados({...dados, cliente: e.target.value})}
                placeholder="Nome do cliente (opcional)"
              />
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Adicionar Itens</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
                <Select value={tipoItem} onValueChange={setTipoItem}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receita">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4" />
                        Manufaturado
                      </div>
                    </SelectItem>
                    <SelectItem value="produto">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Industrializado
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select value={itemSelecionado} onValueChange={(v) => {
                  setItemSelecionado(v);
                  if (tipoItem === "receita") {
                    const receita = receitasAtivas.find(r => r.id === v);
                    if (receita && receita.preco_venda_sugerido) {
                      setValorUnitario(receita.preco_venda_sugerido.toString());
                    }
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder={tipoItem === "receita" ? "Selecione receita" : "Selecione produto"} />
                  </SelectTrigger>
                  <SelectContent>
                    {tipoItem === "receita" ? (
                      receitasAtivas.map(r => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.nome_produto} {r.preco_venda_sugerido ? `(R$ ${r.preco_venda_sugerido.toFixed(2)})` : ''}
                        </SelectItem>
                      ))
                    ) : (
                      produtosAtivos.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.nome} (Estoque: {p.estoque_atual} {p.unidade})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  placeholder="Qtd"
                />

                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={valorUnitario}
                  onChange={(e) => setValorUnitario(e.target.value)}
                  placeholder="R$ Unitário"
                />

                <Button type="button" onClick={adicionarItem} className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </div>

              {itemAtual && tipoItem === "receita" && (
                <div className="bg-blue-50 p-3 rounded mb-4 text-sm">
                  <strong>Ingredientes da receita:</strong>
                  <div className="mt-1">
                    {itemAtual.ingredientes?.map((ing, idx) => (
                      <span key={idx} className="text-gray-700">
                        {ing.ingrediente_nome} ({ing.quantidade} {ing.unidade || 'kg'}){idx < itemAtual.ingredientes.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {dados.itens.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {dados.itens.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {item.tipo === "receita" ? (
                            <Badge className="bg-orange-100 text-orange-800">Manufaturado</Badge>
                          ) : (
                            <Badge className="bg-blue-100 text-blue-800">Industrializado</Badge>
                          )}
                          <span className="font-medium">{item.nome}</span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {item.quantidade}x R$ {item.valor_unitario.toFixed(2)} = R$ {item.valor_total.toFixed(2)}
                        </div>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removerItem(index)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mb-4">Nenhum item adicionado</p>
              )}

              {estoqueProblemas.length > 0 && (
                <Alert className="bg-red-50 border-red-200 mb-4">
                  <AlertDescription className="text-red-800">
                    <strong>⚠️ Problemas de estoque:</strong>
                    <ul className="mt-2 space-y-1 text-sm">
                      {estoqueProblemas.map((problema, idx) => (
                        <li key={idx}>• {problema}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div className="bg-blue-50 p-4 rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-blue-900">Subtotal:</span>
                  <span className="text-lg font-bold text-blue-900">R$ {valorTotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <Label className="text-sm">Desconto (R$):</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max={valorTotal}
                    value={dados.desconto}
                    onChange={(e) => setDados({...dados, desconto: e.target.value})}
                    className="w-32"
                  />
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                  <span className="font-bold text-blue-900">Total:</span>
                  <span className="text-2xl font-bold text-blue-900">R$ {valorFinal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Status do Pedido</Label>
                <Select value={dados.status} onValueChange={(v) => setDados({...dados, status: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Forma de Pagamento</Label>
                <Select value={dados.forma_pagamento} onValueChange={(v) => setDados({...dados, forma_pagamento: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                    <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Observações</Label>
              <Textarea
                value={dados.observacoes}
                onChange={(e) => setDados({...dados, observacoes: e.target.value})}
                placeholder="Observações sobre o pedido..."
                rows={2}
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-green-600 hover:bg-green-700"
                disabled={estoqueProblemas.length > 0 || dados.itens.length === 0}
              >
                Finalizar Pedido
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}