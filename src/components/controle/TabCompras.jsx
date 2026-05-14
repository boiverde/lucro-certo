import React, { useState } from "react";
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/api/httpClient";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AnimatePresence } from "framer-motion";

import FormCompra from "../compras/FormCompra";
import ListaCompras from "../compras/ListaCompras";

export default function TabCompras({ produtos, isOnline, addToQueue }) {
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const queryClient = useQueryClient();

  const { data: rawCompras, isLoading } = useQuery({
    queryKey: ['compras'],
    queryFn: () => httpClient('/compras'),
  });

  const compras = Array.isArray(rawCompras) ? rawCompras : (rawCompras?.results || []);
  const createMutation = useMutation({
    mutationFn: async (dadosForm) => {
      if (!isOnline) {
        addToQueue('create_compra', dadosForm);
        throw new Error('offline');
      }

      const payload = {
        ...dadosForm,
        quantidade: Number(dadosForm.quantidade || 0),
        valor_por_unidade: Number(dadosForm.valor_por_unidade || 0),
        valor_total: Number(dadosForm.valor_total || 0),
        produto_estoque_id: (dadosForm.produto_estoque_id && dadosForm.produto_estoque_id.length > 10) ? dadosForm.produto_estoque_id : null,
      };

      let produtoIdFinal = payload.produto_estoque_id;

      if (adicionar_estoque && !produtoIdFinal) {
        // Criar novo produto no estoque primeiro para ter o ID
        const novoProduto = await httpClient('/produtos', {
          method: 'POST',
          body: JSON.stringify({
            nome: payload.produto,
            unidade: payload.unidade_compra || "unidades",
            estoque_atual: payload.quantidade,
            preco: payload.valor_por_unidade,
            custo: payload.valor_por_unidade,
            estoque_minimo: 0,
            controla_estoque: true,
            ativo: true,
          }),
        });
        produtoIdFinal = novoProduto.id;
        
        await httpClient('/movimentacoes-estoque', {
          method: 'POST',
          body: JSON.stringify({
            produto_id: novoProduto.id,
            produto_nome: novoProduto.nome,
            tipo: 'entrada',
            quantidade: payload.quantidade,
            data: payload.data_compra,
            origem: 'compra',
            observacoes: `Compra inicial - ${payload.fornecedor || 'Fornecedor não informado'}`,
          }),
        });
      } else if (adicionar_estoque && produtoIdFinal) {
        // Atualizar produto existente
        const produto = produtos.find(p => p.id === produtoIdFinal);
        if (produto && produto.controla_estoque) {
          const novoEstoque = Number(produto.estoque_atual || 0) + payload.quantidade;
          await httpClient(`/produtos/${produto.id}`, {
            method: 'PUT',
            body: JSON.stringify({ estoque_atual: novoEstoque }),
          });
          await httpClient('/movimentacoes-estoque', {
            method: 'POST',
            body: JSON.stringify({
              produto_id: produto.id,
              produto_nome: produto.nome,
              tipo: 'entrada',
              quantidade: payload.quantidade,
              data: payload.data_compra,
              origem: 'compra',
              observacoes: `Compra - ${payload.fornecedor || 'Fornecedor não informado'}`,
            }),
          });
        }
      }

      // Agora cria a compra com o produtoIdFinal (seja o existente ou o novo)
      const { adicionar_estoque: _, produto_estoque_id: __, valor_por_unidade: ___, unidade_compra: ____, produto: _____, ...payloadLimpo } = payload;
      
      const compraCriada = await httpClient('/compras', { 
        method: 'POST', 
        body: JSON.stringify({
          ...payloadLimpo,
          produto_id: produtoIdFinal || "" 
        }) 
      });

      return compraCriada;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras'] });
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      queryClient.invalidateQueries({ queryKey: ['movimentacoes-estoque'] });
      setShowForm(false);
      setEditando(null);
    },
    onError: (error) => {
      if (error.message === 'offline') {
        toast.success('Compra salva! Será sincronizada quando voltar online.', { id: 'compra-offline' });
        setShowForm(false);
        setEditando(null);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => httpClient(`/compras/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras'] });
      setShowForm(false);
      setEditando(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => httpClient(`/compras/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['compras'] }),
  });

  const handleSubmit = (dados) => {
    if (editando) {
      updateMutation.mutate({ id: editando.id, data: dados });
    } else {
      createMutation.mutate(dados);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-lg md:text-xl font-bold">Compras</h2>
        <Button
          onClick={() => { setEditando(null); setShowForm(!showForm); }}
          className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />Nova Compra
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {showForm && (
          <FormCompra
            key={editando?.id || 'nova'}
            compra={editando}
            produtos={produtos}
            onSubmit={handleSubmit}
            onCancel={() => { setShowForm(false); setEditando(null); }}
          />
        )}
      </AnimatePresence>

      <ListaCompras
        compras={compras}
        loading={isLoading}
        onEditar={(c) => { setEditando(c); setShowForm(true); }}
        onDeletar={(c) => deleteMutation.mutate(c.id)}
      />
    </div>
  );
}

// Exporta o handler de sync offline para uso no orquestrador
export async function syncCompras(item, queryClient) {
  const data = item.data;
  const { adicionar_estoque, produto_estoque_id, valor_por_unidade, unidade_compra, produto: nomeProd } = data;
  let produtoIdFinal = data.produto_estoque_id;

  if (adicionar_estoque && !produtoIdFinal) {
    const novoProduto = await httpClient('/produtos', {
      method: 'POST',
      body: JSON.stringify({
        nome: data.produto, 
        unidade: data.unidade_compra || "unidades",
        estoque_atual: data.quantidade, 
        preco: data.valor_por_unidade,
        custo: data.valor_por_unidade,
        estoque_minimo: 0,
        controla_estoque: true, 
        ativo: true, 
      }),
    });
    produtoIdFinal = novoProduto.id;

    await httpClient('/movimentacoes-estoque', {
      method: 'POST',
      body: JSON.stringify({
        produto_id: novoProduto.id, produto_nome: novoProduto.nome,
        tipo: 'entrada', quantidade: data.quantidade, data: data.data_compra,
        origem: 'compra', observacoes: `Compra inicial - ${data.fornecedor || 'Fornecedor não informado'}`,
      }),
    });
  } else if (adicionar_estoque && produtoIdFinal) {
    const produto = await httpClient(`/produtos/${produtoIdFinal}`);
    if (produto && produto.controla_estoque) {
      const novoEstoque = Number(produto.estoque_atual || 0) + data.quantidade;
      await httpClient(`/produtos/${produto.id}`, { method: 'PUT', body: JSON.stringify({ estoque_atual: novoEstoque }) });
      await httpClient('/movimentacoes-estoque', {
        method: 'POST',
        body: JSON.stringify({
          produto_id: produto.id, produto_nome: produto.nome,
          tipo: 'entrada', quantidade: data.quantidade, data: data.data_compra,
          origem: 'compra', observacoes: `Compra - ${data.fornecedor || 'Fornecedor não informado'}`,
        }),
      });
    }
  }

  const { adicionar_estoque: _, produto_estoque_id: __, valor_por_unidade: ___, unidade_compra: ____, produto: _____, ...payloadLimpo } = data;

  await httpClient('/compras', { 
    method: 'POST', 
    body: JSON.stringify({
      ...payloadLimpo,
      produto_id: produtoIdFinal || ""
    }) 
  });

  queryClient.invalidateQueries({ queryKey: ['compras'] });
  queryClient.invalidateQueries({ queryKey: ['produtos'] });
  queryClient.invalidateQueries({ queryKey: ['movimentacoes-estoque'] });
}
