import React, { useState } from "react";
import { toast } from 'sonner';
import { handleApiError } from '@/api/errorHandler';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/api/httpClient";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatePresence } from "framer-motion";

import FormIngrediente from "../lanches/FormIngrediente";
import ListaIngredientes from "../lanches/ListaIngredientes";
import FormReceita from "../lanches/FormReceita";
import ListaReceitas from "../lanches/ListaReceitas";
import FormProducao from "../lanches/FormProducao";
import FormPedido from "../lanches/FormPedido";
import ListaPedidos from "../lanches/ListaPedidos";

export default function TabLanches({ produtos, isOnline, addToQueue }) {
  const [lanchesTab, setLanchesTab] = useState("receitas");
  const [showFormIngrediente, setShowFormIngrediente] = useState(false);
  const [editandoIngrediente, setEditandoIngrediente] = useState(null);
  const [showFormReceita, setShowFormReceita] = useState(false);
  const [editandoReceita, setEditandoReceita] = useState(null);
  const [showFormProducao, setShowFormProducao] = useState(false);
  const [receitaProduzir, setReceitaProduzir] = useState(null);
  const [showFormPedido, setShowFormPedido] = useState(false);
  const [diasAlertaPedido, setDiasAlertaPedido] = useState(3);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => httpClient('/auth/me'),
  });

  const { data: rawIngredientes, isLoading: loadingIngredientes } = useQuery({
    queryKey: ['ingredientes'],
    queryFn: () => httpClient('/ingredientes'),
  });

  const ingredientes = Array.isArray(rawIngredientes) ? rawIngredientes : (rawIngredientes?.results || []);

  const { data: rawReceitas, isLoading: loadingReceitas } = useQuery({
    queryKey: ['receitas'],
    queryFn: () => httpClient('/receitas'),
  });

  const receitas = Array.isArray(rawReceitas) ? rawReceitas : (rawReceitas?.results || []);

  const { data: rawProducoes } = useQuery({
    queryKey: ['producoes'],
    queryFn: () => httpClient('/producoes'),
  });

  const producoes = Array.isArray(rawProducoes) ? rawProducoes : (rawProducoes?.results || []);

  const { data: rawPedidos, isLoading: loadingPedidos } = useQuery({
    queryKey: ['pedidos'],
    queryFn: () => httpClient('/pedidos'),
  });

  const pedidos = Array.isArray(rawPedidos) ? rawPedidos : (rawPedidos?.results || []);

  // --- Ingredientes ---
  const createIngredienteMutation = useMutation({
    mutationFn: (data) => httpClient('/ingredientes', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredientes'] });
      setShowFormIngrediente(false);
      setEditandoIngrediente(null);
    },
  });

  const updateIngredienteMutation = useMutation({
    mutationFn: async ({ id, data, ingredienteAntigo }) => {
      await httpClient(`/ingredientes/${id}`, { method: 'PUT', body: JSON.stringify(data) });

      // Recalcular todas as receitas que usam este ingrediente
      const receitasAfetadas = receitas.filter(receita =>
        receita.ingredientes?.some(ing => ing.ingrediente_id === id)
      );

      const precoAntigoCorrigido = ingredienteAntigo.preco_corrigido_kg || ingredienteAntigo.preco_por_kg || 0;
      const precoNovoCorrigido = data.preco_corrigido_kg || data.preco_por_kg || 0;
      const limiteAlerta = user?.limite_aumento_custo_receita || 15;

      for (const receita of receitasAfetadas) {
        let custoTotal = 0;
        for (const item of receita.ingredientes) {
          const ing = item.ingrediente_id === id
            ? { ...ingredientes.find(i => i.id === id), ...data }
            : ingredientes.find(i => i.id === item.ingrediente_id);

          if (ing) {
            const precoUsar = ing.preco_corrigido_kg || ing.preco_por_kg || 0;
            const quantidade = item.quantidade_kg || item.quantidade || 0;
            custoTotal += precoUsar * quantidade;
          }
        }

        const custoAntigo = receita.custo_total || 0;
        const aumentoReceita = custoAntigo > 0 ? ((custoTotal - custoAntigo) / custoAntigo) * 100 : 0;

        await httpClient(`/receitas/${receita.id}`, {
          method: 'PUT',
          body: JSON.stringify({ ...receita, custo_total: custoTotal }),
        });

        if (aumentoReceita > limiteAlerta) {
          toast.warning(`Atenção: A receita "${receita.nome_produto}" teve aumento de ${aumentoReceita.toFixed(1)}% no custo!\nIngrediente: ${data.nome}\nCusto anterior: R$ ${custoAntigo.toFixed(2)}\nNovo custo: R$ ${custoTotal.toFixed(2)}`, { duration: 10000 });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredientes'] });
      queryClient.invalidateQueries({ queryKey: ['receitas'] });
      setShowFormIngrediente(false);
      setEditandoIngrediente(null);
    },
  });

  const deleteIngredienteMutation = useMutation({
    mutationFn: (id) => httpClient(`/ingredientes/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ingredientes'] }),
  });

  // --- Receitas ---
  const createReceitaMutation = useMutation({
    mutationFn: (data) => httpClient('/receitas', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receitas'] });
      setShowFormReceita(false);
      setEditandoReceita(null);
    },
  });

  const updateReceitaMutation = useMutation({
    mutationFn: ({ id, data }) => httpClient(`/receitas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receitas'] });
      setShowFormReceita(false);
      setEditandoReceita(null);
    },
  });

  const deleteReceitaMutation = useMutation({
    mutationFn: (id) => httpClient(`/receitas/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['receitas'] }),
  });

  // --- Produção ---
  const createProducaoMutation = useMutation({
    mutationFn: async (data) => {
      await httpClient('/producoes', { method: 'POST', body: JSON.stringify(data) });

      if (data.descontar_estoque) {
        const receita = receitas.find(r => r.id === data.receita_id);
        if (receita && receita.ingredientes) {
          for (const item of receita.ingredientes) {
            const ing = ingredientes.find(i => i.id === item.ingrediente_id);
            if (ing) {
              const quantidadeTotal = (item.quantidade_kg || item.quantidade) * data.quantidade;
              const novoEstoque = Math.max(0, ing.estoque_atual - quantidadeTotal);
              await httpClient(`/ingredientes/${ing.id}`, {
                method: 'PUT',
                body: JSON.stringify({ estoque_atual: novoEstoque }),
              });
            }
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['producoes'] });
      queryClient.invalidateQueries({ queryKey: ['ingredientes'] });
      setShowFormProducao(false);
      setReceitaProduzir(null);
    },
  });

  // --- Pedidos ---
  const converterParaKg = (quantidade, unidade) => {
    switch (unidade) {
      case 'g': case 'gramas': return quantidade / 1000;
      case 'ml': return quantidade / 1000;
      case 'l': case 'litros': return quantidade;
      case 'kg': return quantidade;
      default: return quantidade;
    }
  };

  const createPedidoMutation = useMutation({
    mutationFn: async (data) => {
      if (!isOnline) {
        addToQueue('create_pedido', data);
        throw new Error('offline');
      }

      await httpClient('/pedidos', { method: 'POST', body: JSON.stringify(data) });

      for (const item of data.itens) {
        if (item.tipo === "produto") {
          const produto = produtos.find(p => p.id === item.id_referencia);
          if (produto && produto.controla_estoque) {
            const novoEstoque = Math.max(0, produto.estoque_atual - item.quantidade);
            await httpClient(`/produtos/${produto.id}`, { method: 'PUT', body: JSON.stringify({ estoque_atual: novoEstoque }) });
            await httpClient('/movimentacoes-estoque', {
              method: 'POST',
              body: JSON.stringify({
                produto_id: produto.id, produto_nome: produto.nome,
                tipo: 'saida', quantidade: item.quantidade, data: data.data_pedido,
                origem: 'venda', observacoes: `Pedido ${data.numero_pedido} - ${data.cliente || 'Cliente não informado'}`,
              }),
            });
          }
        } else if (item.tipo === "receita") {
          const receita = receitas.find(r => r.id === item.id_referencia);
          if (receita && receita.ingredientes) {
            for (const ingredienteReceita of receita.ingredientes) {
              const ing = ingredientes.find(i => i.id === ingredienteReceita.ingrediente_id);
              if (ing) {
                const qtdNecessaria = ingredienteReceita.quantidade_kg
                  ? ingredienteReceita.quantidade_kg * item.quantidade
                  : converterParaKg(ingredienteReceita.quantidade, ingredienteReceita.unidade || 'kg') * item.quantidade;
                const novoEstoque = Math.max(0, ing.estoque_atual - qtdNecessaria);
                await httpClient(`/ingredientes/${ing.id}`, { method: 'PUT', body: JSON.stringify({ estoque_atual: novoEstoque }) });
              }
            }
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      queryClient.invalidateQueries({ queryKey: ['ingredientes'] });
      queryClient.invalidateQueries({ queryKey: ['movimentacoes-estoque'] });
      setShowFormPedido(false);
    },
    onError: (error) => {
      if (error.message === 'offline') {
        toast.success('Pedido salvo! Será sincronizado quando voltar online.', { id: 'pedido-offline' });
        setShowFormPedido(false);
      }
    },
  });

  const updatePedidoMutation = useMutation({
    mutationFn: ({ id, data }) => httpClient(`/pedidos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pedidos'] }),
  });

  const deletePedidoMutation = useMutation({
    mutationFn: (id) => httpClient(`/pedidos/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pedidos'] }),
  });

  return (
    <Tabs value={lanchesTab} onValueChange={setLanchesTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
        <TabsTrigger value="receitas">Receitas</TabsTrigger>
        <TabsTrigger value="ingredientes">Ingredientes</TabsTrigger>
        <TabsTrigger value="config">Config</TabsTrigger>
      </TabsList>

      {/* --- PEDIDOS --- */}
      <TabsContent value="pedidos" className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 className="text-lg md:text-xl font-bold">Pedidos</h2>
          <Button onClick={() => setShowFormPedido(!showFormPedido)} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />Novo Pedido
          </Button>
        </div>
        <AnimatePresence mode="wait">
          {showFormPedido && (
            <FormPedido
              key="novo-pedido"
              receitas={receitas}
              produtos={produtos}
              ingredientes={ingredientes}
              onSubmit={(dados) => createPedidoMutation.mutate(dados)}
              onCancel={() => setShowFormPedido(false)}
            />
          )}
        </AnimatePresence>
        <ListaPedidos
          pedidos={pedidos}
          loading={loadingPedidos}
          onDeletar={(p) => deletePedidoMutation.mutate(p.id)}
          onAtualizarStatus={(p, status) => updatePedidoMutation.mutate({ id: p.id, data: { ...p, status } })}
          diasAlertaPendente={diasAlertaPedido}
        />
      </TabsContent>

      {/* --- RECEITAS --- */}
      <TabsContent value="receitas" className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 className="text-lg md:text-xl font-bold">Receitas de Produtos</h2>
          <Button onClick={() => { setEditandoReceita(null); setShowFormReceita(!showFormReceita); }} className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />Nova Receita
          </Button>
        </div>
        <AnimatePresence mode="wait">
          {showFormReceita && (
            <FormReceita
              key={editandoReceita?.id || 'nova'}
              receita={editandoReceita}
              ingredientes={ingredientes}
              onSubmit={(dados) => editandoReceita ? updateReceitaMutation.mutate({ id: editandoReceita.id, data: dados }) : createReceitaMutation.mutate(dados)}
              onCancel={() => { setShowFormReceita(false); setEditandoReceita(null); }}
            />
          )}
        </AnimatePresence>
        <AnimatePresence mode="wait">
          {showFormProducao && receitaProduzir && (
            <FormProducao
              key={receitaProduzir.id}
              receita={receitaProduzir}
              ingredientes={ingredientes}
              onSubmit={(dados) => createProducaoMutation.mutate(dados)}
              onCancel={() => { setShowFormProducao(false); setReceitaProduzir(null); }}
            />
          )}
        </AnimatePresence>
        <ListaReceitas
          receitas={receitas}
          loading={loadingReceitas}
          onEditar={(r) => { setEditandoReceita(r); setShowFormReceita(true); }}
          onDeletar={(r) => deleteReceitaMutation.mutate(r.id)}
          onProduzir={(r) => { setReceitaProduzir(r); setShowFormProducao(true); }}
        />
      </TabsContent>

      {/* --- INGREDIENTES --- */}
      <TabsContent value="ingredientes" className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 className="text-lg md:text-xl font-bold">Ingredientes</h2>
          <Button onClick={() => { setEditandoIngrediente(null); setShowFormIngrediente(!showFormIngrediente); }} className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />Novo Ingrediente
          </Button>
        </div>
        <AnimatePresence mode="wait">
          {showFormIngrediente && (
            <FormIngrediente
              key={editandoIngrediente?.id || 'novo'}
              ingrediente={editandoIngrediente}
              onSubmit={(dados) => editandoIngrediente
                ? updateIngredienteMutation.mutate({ id: editandoIngrediente.id, data: dados, ingredienteAntigo: editandoIngrediente })
                : createIngredienteMutation.mutate(dados)}
              onCancel={() => { setShowFormIngrediente(false); setEditandoIngrediente(null); }}
            />
          )}
        </AnimatePresence>
        <ListaIngredientes
          ingredientes={ingredientes}
          loading={loadingIngredientes}
          onEditar={(ing) => { setEditandoIngrediente(ing); setShowFormIngrediente(true); }}
          onDeletar={(ing) => deleteIngredienteMutation.mutate(ing.id)}
        />
      </TabsContent>

      {/* --- CONFIG --- */}
      <TabsContent value="config" className="space-y-6">
        <Card className="shadow-lg">
          <CardHeader><CardTitle>Configurações de Lanches</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Margem de Lucro Padrão (%)</Label>
              <Input
                type="number" step="0.01"
                defaultValue={user?.margem_lucro_padrao || 30}
                onBlur={async (e) => {
                  try {
                    await httpClient('/auth/me', { method: 'PUT', body: JSON.stringify({ margem_lucro_padrao: parseFloat(e.target.value) || 30 }) });
                    toast.success('Margem padrão salva!', { id: 'margem-padrao' });
                  } catch (error) {
                    handleApiError(error, 'salvar as alterações');
                  }
                }}
                placeholder="30"
              />
              <p className="text-sm text-gray-500 mt-2">Esta margem será usada automaticamente ao criar novas receitas.</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-4">
              <div>
                <h4 className="font-semibold text-yellow-900 mb-3">🔔 Alertas de Custo</h4>
                <Label>Alerta de Aumento de Custo (%)</Label>
                <Input
                  type="number" step="0.1"
                  defaultValue={user?.limite_aumento_custo_receita || 15}
                  onBlur={async (e) => {
                    try {
                      await httpClient('/auth/me', { method: 'PUT', body: JSON.stringify({ limite_aumento_custo_receita: parseFloat(e.target.value) || 15 }) });
                      toast.success('Limite de alerta salvo!', { id: 'limite-alerta' });
                    } catch (error) {
                      handleApiError(error, 'salvar as alterações');
                    }
                  }}
                  placeholder="15"
                />
                <p className="text-sm text-yellow-700 mt-2">Você será alertado quando o custo de uma receita aumentar mais que esta porcentagem ao atualizar ingredientes.</p>
              </div>

              <div className="border-t border-yellow-300 pt-4">
                <h4 className="font-semibold text-yellow-900 mb-3">⏰ Alertas de Pedidos</h4>
                <Label>Alerta de Pedido Pendente (dias)</Label>
                <Input
                  type="number" min="1"
                  value={diasAlertaPedido}
                  onChange={(e) => setDiasAlertaPedido(parseInt(e.target.value) || 3)}
                  onBlur={async (e) => {
                    try {
                      await httpClient('/auth/me', { method: 'PUT', body: JSON.stringify({ dias_alerta_pedido_pendente: parseInt(e.target.value) || 3 }) });
                      toast.success('Alerta de pedidos salvo!', { id: 'alerta-pedidos' });
                    } catch (error) {
                      handleApiError(error, 'salvar as alterações');
                    }
                  }}
                  placeholder="3"
                />
                <p className="text-sm text-yellow-700 mt-2">Pedidos pendentes há mais de {diasAlertaPedido} dias serão destacados com um alerta.</p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Dica</h4>
              <p className="text-sm text-blue-800">
                Para cálculo avançado com <strong>Markup</strong> baseado em custos fixos e variáveis,
                vá em <strong>Configurações → Markup</strong> no menu principal.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
