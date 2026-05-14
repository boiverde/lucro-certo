import React, { useState } from "react";
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/api/httpClient";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AnimatePresence } from "framer-motion";

import FormVenda from "../vendas/FormVenda";
import ListaVendas from "../vendas/ListaVendas";

export default function TabVendas({ produtos, isOnline, addToQueue }) {
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const queryClient = useQueryClient();

  const { data: rawVendas, isLoading } = useQuery({
    queryKey: ['vendas'],
    queryFn: () => httpClient('/vendas'),
  });

  const vendas = Array.isArray(rawVendas) ? rawVendas : (rawVendas?.results || []);

  const createMutation = useMutation({
    mutationFn: async (data) => {
      if (!isOnline) {
        addToQueue('create_venda', data);
        throw new Error('offline');
      }

      const payload = {
        data_venda: data.data_venda || new Date().toISOString(),
        cliente_nome: data.cliente || null,
        valor_total: Number(data.valor_total || 0),
        observacoes: data.observacoes || null,
        itens: [{
          produtoId: (data.produto_estoque_id && data.produto_estoque_id.length > 10) ? data.produto_estoque_id : null,
          nome_produto: data.produto,
          quantidade: Number(data.quantidade || 0),
          preco_unitario: Number(data.preco_por_unidade || 0),
          subtotal: Number(data.valor_total || 0)
        }]
      };

      const vendaCriada = await httpClient('/vendas', { 
        method: 'POST', 
        body: JSON.stringify(payload) 
      });

      return vendaCriada;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendas'] });
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      queryClient.invalidateQueries({ queryKey: ['movimentacoes-estoque'] });
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      setShowForm(false);
      setEditando(null);
    },
    onError: (error) => {
      if (error.message === 'offline') {
        toast.success('Venda salva! Será sincronizada quando voltar online.', { id: 'venda-offline' });
        setShowForm(false);
        setEditando(null);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => httpClient(`/vendas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendas'] });
      setShowForm(false);
      setEditando(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => httpClient(`/vendas/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vendas'] }),
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
        <h2 className="text-lg md:text-xl font-bold">Vendas</h2>
        <Button
          onClick={() => { setEditando(null); setShowForm(!showForm); }}
          className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />Nova Venda
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {showForm && (
          <FormVenda
            key={editando?.id || 'nova'}
            venda={editando}
            produtos={produtos}
            onSubmit={handleSubmit}
            onCancel={() => { setShowForm(false); setEditando(null); }}
          />
        )}
      </AnimatePresence>

      <ListaVendas
        vendas={vendas}
        loading={isLoading}
        onEditar={(v) => { setEditando(v); setShowForm(true); }}
        onDeletar={(v) => deleteMutation.mutate(v.id)}
      />
    </div>
  );
}

// Exporta o handler de sync offline para uso no orquestrador
export async function syncVendas(item, queryClient) {
  const data = item.data;

  const payload = {
    data_venda: data.data_venda || new Date().toISOString(),
    cliente_nome: data.cliente_nome || data.cliente || "Consumidor",
    valor_total: Number(data.valor_total || 0),
    pago: !!data.pago,
    forma_pagamento: data.forma_pagamento || "dinheiro",
    itens: data.itens || [{
      produto_estoque_id: (data.produto_estoque_id && data.produto_estoque_id.length > 10) ? data.produto_estoque_id : undefined,
      nome_produto: data.produto || data.nome_produto || "Produto",
      quantidade: Number(data.quantidade || 0),
      preco_unitario: Number(data.preco_por_unidade || data.preco_unitario || 0),
      unidade: data.unidade_venda || data.unidade || "unidades"
    }]
  };

  await httpClient('/vendas', { 
    method: 'POST', 
    body: JSON.stringify(payload) 
  });

  queryClient.invalidateQueries({ queryKey: ['vendas'] });
  queryClient.invalidateQueries({ queryKey: ['produtos'] });
  queryClient.invalidateQueries({ queryKey: ['movimentacoes-estoque'] });
  queryClient.invalidateQueries({ queryKey: ['clientes'] });
}
