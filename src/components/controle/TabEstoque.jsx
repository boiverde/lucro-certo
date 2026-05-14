import React, { useState } from "react";
import { toast } from 'sonner';
import { keepPreviousData, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/api/httpClient";
import { Button } from "@/components/ui/button";
import { Plus, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatePresence } from "framer-motion";

import FormProduto from "../estoque/FormProduto";
import ListaProdutos from "../estoque/ListaProdutos";
import FormMovimentacao from "../estoque/FormMovimentacao";
import HistoricoMovimentacoes from "../estoque/HistoricoMovimentacoes";
import ResumoEstoque from "../estoque/ResumoEstoque";
import NotificationManager from "../mobile/NotificationManager";
import AlertasInteligentes from "../estoque/AlertasInteligentes";
import SugestaoCompras from "../estoque/SugestaoCompras";
import GerenciadorLotes from "../estoque/GerenciadorLotes";
import GerenciadorFornecedores from "../estoque/GerenciadorFornecedores";
import RelatorioGiroEstoque from "../estoque/RelatorioGiroEstoque";
import Pagination from "@/components/ui/pagination";

export default function TabEstoque({ isOnline, addToQueue }) {
  const [estoqueTab, setEstoqueTab] = useState("produtos");
  const [showFormProduto, setShowFormProduto] = useState(false);
  const [editandoProduto, setEditandoProduto] = useState(null);
  const [showFormMovimentacao, setShowFormMovimentacao] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data: produtosData = { results: [], meta: null }, isLoading: loadingProdutos } = useQuery({
    queryKey: ['produtos', page],
    queryFn: () => httpClient(`/produtos?page=${page}&limit=50`),
    placeholderData: keepPreviousData,
  });

  const produtos = Array.isArray(produtosData) ? produtosData : (produtosData?.results || produtosData?.data || []);
  const meta = Array.isArray(produtosData) ? null : produtosData.meta;

  const { data: rawMovimentacoes, isLoading: loadingMovimentacoes } = useQuery({
    queryKey: ['movimentacoes-estoque'],
    queryFn: () => httpClient('/movimentacoes-estoque'),
  });

  const movimentacoes = Array.isArray(rawMovimentacoes) ? rawMovimentacoes : (rawMovimentacoes?.results || []);

  const createProdutoMutation = useMutation({
    mutationFn: async (data) => {
      if (!isOnline) {
        addToQueue('create_produto', data);
        throw new Error('offline');
      }
      return httpClient('/produtos', { method: 'POST', body: JSON.stringify(data) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      setShowFormProduto(false);
      setEditandoProduto(null);
    },
    onError: (error) => {
      if (error.message === 'offline') {
        toast.success('Produto salvo! Será sincronizado quando voltar online.', { id: 'produto-offline' });
        setShowFormProduto(false);
        setEditandoProduto(null);
      }
    },
  });

  const updateProdutoMutation = useMutation({
    mutationFn: ({ id, data }) => httpClient(`/produtos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      setShowFormProduto(false);
      setEditandoProduto(null);
    },
  });

  const createMovimentacaoMutation = useMutation({
    mutationFn: async (data) => {
      if (!isOnline) {
        addToQueue('create_movimentacao', data);
        throw new Error('offline');
      }

      await httpClient('/movimentacoes-estoque', { method: 'POST', body: JSON.stringify(data) });

      const produto = produtos.find(p => p.id === data.produto_id);
      if (produto) {
        let novoEstoque = produto.estoque_atual;
        if (data.tipo === 'entrada') novoEstoque += data.quantidade;
        else if (data.tipo === 'saida' || data.tipo === 'perda') novoEstoque -= data.quantidade;
        else if (data.tipo === 'ajuste') novoEstoque = data.quantidade;

        await httpClient(`/produtos/${produto.id}`, {
          method: 'PUT',
          body: JSON.stringify({ estoque_atual: Math.max(0, novoEstoque) }),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      queryClient.invalidateQueries({ queryKey: ['movimentacoes-estoque'] });
      setShowFormMovimentacao(false);
      setProdutoSelecionado(null);
    },
    onError: (error) => {
      if (error.message === 'offline') {
        toast.success('Movimentação salva! Será sincronizada quando voltar online.', { id: 'mov-offline' });
        setShowFormMovimentacao(false);
        setProdutoSelecionado(null);
      }
    },
  });

  const produtosComEstoqueBaixo = produtos.filter(
    p => p.ativo && p.estoque_atual <= p.estoque_minimo && p.estoque_minimo > 0
  );

  const handleSubmitProduto = (dados) => {
    if (editandoProduto) {
      updateProdutoMutation.mutate({ id: editandoProduto.id, data: dados });
    } else {
      createProdutoMutation.mutate(dados);
    }
  };

  return (
    <div className="space-y-6">
      <NotificationManager produtos={produtos} />

      {produtosComEstoqueBaixo.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900">
                {produtosComEstoqueBaixo.length} produto(s) com estoque baixo
              </h3>
              <div className="mt-2 space-y-1">
                {produtosComEstoqueBaixo.slice(0, 3).map(p => (
                  <p key={p.id} className="text-sm text-orange-700">
                    • {p.nome}: {p.estoque_atual} {p.unidade}
                  </p>
                ))}
                {produtosComEstoqueBaixo.length > 3 && (
                  <p className="text-sm text-orange-700">+ {produtosComEstoqueBaixo.length - 3} outros</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <ResumoEstoque produtos={produtos} movimentacoes={movimentacoes} />

      <Tabs value={estoqueTab} onValueChange={setEstoqueTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="alertas">Alertas</TabsTrigger>
          <TabsTrigger value="sugestoes">Sugestões</TabsTrigger>
          <TabsTrigger value="lotes">Lotes</TabsTrigger>
          <TabsTrigger value="fornecedores">Fornec.</TabsTrigger>
        </TabsList>

        <TabsContent value="produtos" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-lg md:text-xl font-bold">Produtos</h2>
            <Button
              onClick={() => { setEditandoProduto(null); setShowFormProduto(!showFormProduto); }}
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />Novo Produto
            </Button>
          </div>

          <AnimatePresence mode="wait">
            {showFormProduto && (
              <FormProduto
                key={editandoProduto?.id || 'nova'}
                produto={editandoProduto}
                onSubmit={handleSubmitProduto}
                onCancel={() => { setShowFormProduto(false); setEditandoProduto(null); }}
              />
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {showFormMovimentacao && produtoSelecionado && (
              <FormMovimentacao
                key={produtoSelecionado?.id || 'nova'}
                produto={produtoSelecionado}
                onSubmit={(dados) => createMovimentacaoMutation.mutate(dados)}
                onCancel={() => { setShowFormMovimentacao(false); setProdutoSelecionado(null); }}
              />
            )}
          </AnimatePresence>

          <ListaProdutos
            produtos={produtos}
            loading={loadingProdutos}
            onEditar={(p) => { setEditandoProduto(p); setShowFormProduto(true); }}
            onAdicionarEntrada={(p) => { setProdutoSelecionado({ ...p, tipoInicial: 'entrada' }); setShowFormMovimentacao(true); }}
            onAdicionarSaida={(p) => { setProdutoSelecionado({ ...p, tipoInicial: 'saida' }); setShowFormMovimentacao(true); }}
          />

          <Pagination meta={meta} onPageChange={(p) => setPage(p)} />

          <Card className="mt-6">
            <CardHeader><CardTitle>📊 Análise de Giro de Estoque</CardTitle></CardHeader>
            <CardContent><RelatorioGiroEstoque /></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alertas" className="space-y-6"><AlertasInteligentes /></TabsContent>
        <TabsContent value="sugestoes" className="space-y-6"><SugestaoCompras /></TabsContent>
        <TabsContent value="lotes" className="space-y-6"><GerenciadorLotes /></TabsContent>
        <TabsContent value="fornecedores" className="space-y-6"><GerenciadorFornecedores /></TabsContent>
      </Tabs>
    </div>
  );
}

// Exporta os handlers de sync offline para uso no orquestrador
export async function syncEstoque(item, queryClient) {
  if (item.type === 'create_produto') {
    await httpClient('/produtos', { method: 'POST', body: JSON.stringify(item.data) });
    queryClient.invalidateQueries({ queryKey: ['produtos'] });
  } else if (item.type === 'create_movimentacao') {
    await httpClient('/movimentacoes-estoque', { method: 'POST', body: JSON.stringify(item.data) });
    const produto = await httpClient(`/produtos/${item.data.produto_id}`);
    if (produto) {
      let novoEstoque = produto.estoque_atual;
      if (item.data.tipo === 'entrada') novoEstoque += item.data.quantidade;
      else if (item.data.tipo === 'saida' || item.data.tipo === 'perda') novoEstoque -= item.data.quantidade;
      else if (item.data.tipo === 'ajuste') novoEstoque = item.data.quantidade;
      await httpClient(`/produtos/${produto.id}`, { method: 'PUT', body: JSON.stringify({ estoque_atual: Math.max(0, novoEstoque) }) });
    }
    queryClient.invalidateQueries({ queryKey: ['produtos'] });
    queryClient.invalidateQueries({ queryKey: ['movimentacoes-estoque'] });
  }
}
