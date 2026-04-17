import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import CalculadoraCustoTotal, { useCustoTotal } from "../receitas/CalculadoraCustoTotal";
import PricingAssistant from "../configuracoes/PricingAssistant";
import { usePlan } from "@/api/usePlan";

const capitalizar = (texto) => {
  return texto
    .toLowerCase()
    .split(' ')
    .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
    .join(' ');
};

export default function FormReceita({ receita, ingredientes, onSubmit, onCancel }) {
  const [dados, setDados] = useState(receita || {
    nome_produto: "",
    categoria: "outros",
    ingredientes: [],
    preco_venda_sugerido: "",
    margem_lucro: "",
    tempo_preparo: "",
    observacoes: "",
    ativo: true
  });

  const [ingredienteSelecionado, setIngredienteSelecionado] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [unidadeQuantidade, setUnidadeQuantidade] = useState("kg");
  const [margemPadrao, setMargemPadrao] = useState(30);
  const [usarMarkup, setUsarMarkup] = useState(false);
  const [markup, setMarkup] = useState(0);
  const [configuracoes, setConfiguracoes] = useState(null);
  const { plan } = usePlan();

  useEffect(() => {
    const carregarConfiguracoes = async () => {
      try {
        const user = await base44.auth.me();
        setConfiguracoes(user);
        if (user.margem_lucro_padrao) {
          setMargemPadrao(user.margem_lucro_padrao);
          if (!receita && !dados.margem_lucro) {
            setDados(prev => ({...prev, margem_lucro: user.margem_lucro_padrao}));
          }
        }
        if (user.markup_calculado) {
          setMarkup(user.markup_calculado);
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    };
    carregarConfiguracoes();
  }, []);

  const converterParaKg = (quantidade, unidade) => {
    switch(unidade) {
      case 'g': return quantidade / 1000;
      case 'ml': return quantidade / 1000;
      case 'l': return quantidade;
      case 'kg': return quantidade;
      default: return quantidade;
    }
  };

  const custoIngredientes = dados.ingredientes.reduce((total, item) => {
    const ing = ingredientes.find(i => i.id === item.ingrediente_id);
    if (!ing) return total;
    
    let qtdKg;
    if (item.quantidade_kg) {
      qtdKg = item.quantidade_kg;
    } else {
      qtdKg = converterParaKg(item.quantidade || 0, item.unidade || 'kg');
    }
    
    const precoUsar = ing.preco_corrigido_kg || ing.preco_por_kg;
    return total + (precoUsar * qtdKg);
    }, 0);

    const custoTotalCalc = useCustoTotal(
    custoIngredientes, 
    parseInt(dados.tempo_preparo) || 0,
    configuracoes
    );
    const custoTotal = custoTotalCalc.custoTotal;

  // Removido useEffect que setava preço automaticamente sem permissão do usuário

  const adicionarIngrediente = () => {
    if (!ingredienteSelecionado || !quantidade) return;

    const ing = ingredientes.find(i => i.id === ingredienteSelecionado);
    if (!ing) return;

    const qtd = parseFloat(quantidade);
    const qtdKg = converterParaKg(qtd, unidadeQuantidade);

    const novoItem = {
      ingrediente_id: ing.id,
      ingrediente_nome: ing.nome,
      quantidade: qtd,
      unidade: unidadeQuantidade,
      quantidade_kg: qtdKg
    };

    setDados({
      ...dados,
      ingredientes: [...dados.ingredientes, novoItem]
    });

    setIngredienteSelecionado("");
    setQuantidade("");
    setUnidadeQuantidade("kg");
  };

  const removerIngrediente = (index) => {
    setDados({
      ...dados,
      ingredientes: dados.ingredientes.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (dados.ingredientes.length === 0) {
      alert("Adicione pelo menos um ingrediente");
      return;
    }

    onSubmit({
      ...dados,
      custo_total: custoTotal,
      preco_venda_sugerido: parseFloat(dados.preco_venda_sugerido) || 0,
      margem_lucro: parseFloat(dados.margem_lucro) || 0,
      tempo_preparo: parseInt(dados.tempo_preparo) || 0
    });
  };

  const ingredientesDisponiveis = ingredientes.filter(i => 
    i.ativo && !dados.ingredientes.some(item => item.ingrediente_id === i.id)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{receita ? 'Editar' : 'Nova'} Receita</CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nome do Produto *</Label>
                <Input
                  value={dados.nome_produto}
                  onChange={(e) => setDados({...dados, nome_produto: capitalizar(e.target.value)})}
                  placeholder="Ex: Pizza Margherita"
                  required
                />
              </div>

              <div>
                <Label>Categoria *</Label>
                <Select value={dados.categoria} onValueChange={(v) => setDados({...dados, categoria: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pizza">Pizza</SelectItem>
                    <SelectItem value="hamburguer">Hambúrguer</SelectItem>
                    <SelectItem value="salgado">Salgado</SelectItem>
                    <SelectItem value="petisco">Petisco</SelectItem>
                    <SelectItem value="bebida">Bebida</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Tempo de Preparo (min)</Label>
                <Input
                  type="number"
                  value={dados.tempo_preparo}
                  onChange={(e) => setDados({...dados, tempo_preparo: e.target.value})}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Ingredientes da Receita</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                <Select value={ingredienteSelecionado} onValueChange={setIngredienteSelecionado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione ingrediente" />
                  </SelectTrigger>
                  <SelectContent>
                    {ingredientesDisponiveis.map(ing => {
                      const precoUsar = ing.preco_corrigido_kg || ing.preco_por_kg;
                      return (
                        <SelectItem key={ing.id} value={ing.id}>
                          {ing.nome} (R$ {precoUsar?.toFixed(2)}/kg{ing.fator_correcao > 1 ? ' ✓' : ''})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.001"
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                    placeholder="Qtd"
                    className="flex-1"
                  />
                  <Select value={unidadeQuantidade} onValueChange={setUnidadeQuantidade}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="g">gramas</SelectItem>
                      <SelectItem value="l">litros</SelectItem>
                      <SelectItem value="ml">ml</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="button" onClick={adicionarIngrediente} className="bg-green-600 hover:bg-green-700 md:col-span-2">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </div>

              {dados.ingredientes.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {dados.ingredientes.map((item, index) => {
                    const ing = ingredientes.find(i => i.id === item.ingrediente_id);

                    let qtdKg;
                    if (item.quantidade_kg) {
                      qtdKg = item.quantidade_kg;
                    } else {
                      qtdKg = converterParaKg(item.quantidade || 0, item.unidade || 'kg');
                    }

                    const precoUsar = ing ? (ing.preco_corrigido_kg || ing.preco_por_kg) : 0;
                    const custo = precoUsar * qtdKg;

                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex-1">
                          <span className="font-medium">{item.ingrediente_nome}</span>
                          <div className="text-sm text-gray-600">
                            {item.quantidade} {item.unidade || 'kg'} × R$ {precoUsar?.toFixed(2)}/kg = R$ {custo.toFixed(2)}
                            {ing?.fator_correcao > 1 && (
                              <span className="text-blue-600 ml-1">(corrigido)</span>
                            )}
                          </div>
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removerIngrediente(index)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mb-4">Nenhum ingrediente adicionado</p>
              )}

              <CalculadoraCustoTotal
                custoIngredientes={custoIngredientes}
                tempoPreparo={parseInt(dados.tempo_preparo) || 0}
                custoMaoObraHora={configuracoes?.custo_mao_obra_hora || 0}
                custoFixoUnidade={configuracoes?.custo_fixo_por_unidade || 0}
              />
            </div>

            {custoTotal > 0 && (
              <PricingAssistant 
                cost={custoTotal}
                currentPrice={parseFloat(dados.preco_venda_sugerido) || 0}
                configs={configuracoes}
                isPro={plan === 'pro'}
                onApply={(val) => setDados({...dados, preco_venda_sugerido: val})}
              />
            )}

              <div className="md:col-span-2">
                <Label>Preço de Venda Final</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={dados.preco_venda_sugerido}
                  onChange={(e) => setDados({...dados, preco_venda_sugerido: e.target.value})}
                  placeholder="0.00"
                  className="h-12 text-lg font-bold text-blue-900"
                />
              </div>

            <div>
              <Label>Observações</Label>
              <Textarea
                value={dados.observacoes}
                onChange={(e) => setDados({...dados, observacoes: e.target.value})}
                placeholder="Modo de preparo, dicas, etc."
                rows={3}
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                {receita ? 'Atualizar' : 'Salvar'} Receita
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}