import React, { useState } from "react";
import { toast } from 'sonner';
import { httpClient } from "@/api/httpClient";
import { keepPreviousData, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Package, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatePresence } from "framer-motion";

import FormProduto from "../components/estoque/FormProduto";
import ListaProdutos from "../components/estoque/ListaProdutos";
import FormMovimentacao from "../components/estoque/FormMovimentacao";
import HistoricoMovimentacoes from "../components/estoque/HistoricoMovimentacoes";
import ResumoEstoque from "../components/estoque/ResumoEstoque";
import NotificationManager from "../components/mobile/NotificationManager";
import OfflineManager, { useOffline } from "../components/mobile/OfflineManager";
import Pagination from "@/components/ui/pagination";

export default function EstoquePage() {
  const [showFormProduto, setShowFormProduto] = useState(false);
  const [showFormMovimentacao, setShowFormMovimentacao] = useState(false);
  const [editandoProduto, setEditandoProduto] = useState(null);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [page, setPage] = useState(1);

  const queryClient = useQueryClient();
  const { isOnline, addToQueue } = useOffline();

  const { data: produtosData = { data: [], meta: null }, isLoading: loadingProdutos } = useQuery({
    queryKey: ['produtos', page],
    queryFn: () => httpClient(`/produtos?page=${page}&limit=50`),
    placeholderData: keepPreviousData,
  });

  const produtos = Array.isArray(produtosData) ? produtosData : (produtosData.data || []);
  const meta = Array.isArray(produtosData) ? null : produtosData.meta;

  const { data: movimentacoes = [], isLoading: loadingMovimentacoes } = useQuery({
    queryKey: ['movimentacoes-estoque'],
    queryFn: () => httpClient('/movimentacoes-estoque'),
  });

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
    }
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

      // Criar a movimentação
      await httpClient('/movimentacoes-estoque', { method: 'POST', body: JSON.stringify(data) });

      // Atualizar o estoque do produto
      const produto = produtos.find(p => p.id === data.produto_id);
      if (produto) {
        let novoEstoque = produto.estoque_atual;

        if (data.tipo === 'entrada') {
          novoEstoque += data.quantidade;
        } else if (data.tipo === 'saida' || data.tipo === 'perda') {
          novoEstoque -= data.quantidade;
        } else if (data.tipo === 'ajuste') {
          novoEstoque = data.quantidade;
        }

        await httpClient(`/produtos/${produto.id}`, {
          method: 'PUT',
          body: JSON.stringify({ estoque_atual: Math.max(0, novoEstoque) })
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
    }
  });

  const handleSubmitProduto = async (dados) => {
    if (editandoProduto) {
      updateProdutoMutation.mutate({ id: editandoProduto.id, data: dados });
    } else {
      createProdutoMutation.mutate(dados);
    }
  };

  const handleSubmitMovimentacao = async (dados) => {
    createMovimentacaoMutation.mutate(dados);
  };

  const handleEditarProduto = (produto) => {
    setEditandoProduto(produto);
    setShowFormProduto(true);
  };

  const handleAdicionarMovimentacao = (produto, tipo) => {
    setProdutoSelecionado({ ...produto, tipoInicial: tipo });
    setShowFormMovimentacao(true);
  };

  const handleSync = async (item) => {
    if (item.type === 'create_produto') {
      await httpClient('/produtos', { method: 'POST', body: JSON.stringify(item.data) });
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
    } else if (item.type === 'create_movimentacao') {
      await httpClient('/movimentacoes-estoque', { method: 'POST', body: JSON.stringify(item.data) });

      const produto = produtos.find(p => p.id === item.data.produto_id);
      if (produto) {
        let novoEstoque = produto.estoque_atual;

        if (item.data.tipo === 'entrada') {
          novoEstoque += item.data.quantidade;
        } else if (item.data.tipo === 'saida' || item.data.tipo === 'perda') {
          novoEstoque -= item.data.quantidade;
        } else if (item.data.tipo === 'ajuste') {
          novoEstoque = item.data.quantidade;
        }

        await httpClient(`/produtos/${produto.id}`, {
          method: 'PUT',
          body: JSON.stringify({ estoque_atual: Math.max(0, novoEstoque) })
        });
      }

      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      queryClient.invalidateQueries({ queryKey: ['movimentacoes-estoque'] });
    }
  };

  const produtosComEstoqueBaixo = produtos.filter(
    p => p.ativo && p.estoque_atual <= p.estoque_minimo && p.estoque_minimo > 0
  );

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <OfflineManager onSync={handleSync} />

      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Estoque</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">
            Controle de produtos e movimentações
          </p>
        </div>

        <NotificationManager produtos={produtos} />

        {produtosComEstoqueBaixo.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900">
                  {produtosComEstoqueBaixo.length} produto(s) com estoque baixo
                </h3>
                <div className="mt-2 space-y-1">
                  {produtosComEstoqueBaixo.map(p => (
                    <p key={p.id} className="text-sm text-orange-700">
                      • {p.nome}: {p.estoque_atual} {p.unidade} (mínimo: {p.estoque_minimo})
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <ResumoEstoque produtos={produtos} movimentacoes={movimentacoes} />

        <Tabs defaultValue="produtos" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger value="produtos" className="text-xs md:text-sm py-2">Produtos</TabsTrigger>
            <TabsTrigger value="historico" className="text-xs md:text-sm py-2">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="produtos" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-lg md:text-xl font-bold">Meus Produtos</h2>
              <Button
                onClick={() => {
                  setEditandoProduto(null);
                  setShowFormProduto(!showFormProduto);
                }}
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Novo Produto
              </Button>
            </div>

            <AnimatePresence mode="wait">
              {showFormProduto && (
                <FormProduto
                  key={editandoProduto?.id || 'novo'}
                  produto={editandoProduto}
                  onSubmit={handleSubmitProduto}
                  onCancel={() => {
                    setShowFormProduto(false);
                    setEditandoProduto(null);
                  }}
                />
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {showFormMovimentacao && produtoSelecionado && (
                <FormMovimentacao
                  key={produtoSelecionado?.id || 'nova'}
                  produto={produtoSelecionado}
                  onSubmit={handleSubmitMovimentacao}
                  onCancel={() => {
                    setShowFormMovimentacao(false);
                    setProdutoSelecionado(null);
                  }}
                />
              )}
            </AnimatePresence>

            <ListaProdutos
              produtos={produtos}
              loading={loadingProdutos}
              onEditar={handleEditarProduto}
              onAdicionarEntrada={(p) => handleAdicionarMovimentacao(p, 'entrada')}
              onAdicionarSaida={(p) => handleAdicionarMovimentacao(p, 'saida')}
            />

            <Pagination meta={meta} onPageChange={(p) => setPage(p)} />
          </TabsContent>

          <TabsContent value="historico" className="space-y-6">
            <HistoricoMovimentacoes
              movimentacoes={movimentacoes}
              loading={loadingMovimentacoes}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}