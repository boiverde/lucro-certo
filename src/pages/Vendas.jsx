import React, { useState, useEffect } from "react";
import { toast } from 'sonner';
import { base44 } from "@/api/base44Client";
import { keepPreviousData, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatePresence } from "framer-motion";

import FormVenda from "../components/vendas/FormVenda";
import ListaVendas from "../components/vendas/ListaVendas";
import Pagination from "@/components/ui/pagination";
import OfflineManager, { useOffline } from "../components/mobile/OfflineManager";

export default function VendasPage() {
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [user, setUser] = useState(null);
  const [page, setPage] = useState(1);

  const queryClient = useQueryClient();
  const { isOnline, addToQueue } = useOffline();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: vendasData = { data: [], meta: null }, isLoading: loadingVendas } = useQuery({
    queryKey: ['vendas', page],
    queryFn: async () => {
      const result = await base44.entities.Venda.filterPaginated(
        { created_by: user?.email },
        '-data_venda',
        page,
        50
      );
      return result;
    },
    enabled: !!user,
    placeholderData: keepPreviousData,
  });

  const vendas = vendasData.data;

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos'],
    queryFn: async () => {
      const result = await base44.entities.Produto.filter(
        { created_by: user?.email, ativo: true },
        'nome'
      );
      return result;
    },
    enabled: !!user,
  });

  const createVendaMutation = useMutation({
    mutationFn: async (data) => {
      if (!isOnline) {
        addToQueue('create_venda', data);
        throw new Error('offline');
      }

      // Criar a venda (o backend já processará o estoque e movimentação em transação)
      const vendaCriada = await base44.entities.Venda.create(data);
      return vendaCriada;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendas'] });
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      queryClient.invalidateQueries({ queryKey: ['movimentacoes-estoque'] });
      setShowForm(false);
      setEditando(null);
    },
    onError: (error) => {
      if (error.message === 'offline') {
        toast.success('Venda salva! Será sincronizada quando voltar online.', { id: 'Venda salva! Será sincronizada quando voltar online.' })
        setShowForm(false);
        setEditando(null);
      } else {
        toast.error('Erro ao salvar venda: ${error.message}')
      }
    }
  });

  const updateVendaMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Venda.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendas'] });
      setShowForm(false);
      setEditando(null);
    },
  });

  const deleteVendaMutation = useMutation({
    mutationFn: (id) => base44.entities.Venda.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendas'] });
    },
  });

  const handleSubmit = async (dados) => {
    if (editando) {
      updateVendaMutation.mutate({ id: editando.id, data: dados });
    } else {
      createVendaMutation.mutate(dados);
    }
  };

  const handleEditar = (venda) => {
    setEditando(venda);
    setShowForm(true);
  };

  const handleDeletar = (venda) => {
    deleteVendaMutation.mutate(venda.id);
  };

  const handleSync = async (item) => {
    if (item.type === 'create_venda') {
      const data = item.data;
      try {
        await base44.entities.Venda.create(data);
        queryClient.invalidateQueries({ queryKey: ['vendas'] });
        queryClient.invalidateQueries({ queryKey: ['produtos'] });
        queryClient.invalidateQueries({ queryKey: ['movimentacoes-estoque'] });
      } catch (err) {
        toast.error('Erro ao sincronizar venda offline: ${err.message}')
      }
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <OfflineManager onSync={handleSync} />
      
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vendas</h1>
            <p className="text-gray-500 mt-1">Gerencie suas vendas de produtos</p>
          </div>
          <Button 
            onClick={() => {
              setEditando(null);
              setShowForm(!showForm);
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nova Venda
          </Button>
        </div>

        <AnimatePresence>
          {showForm && (
            <FormVenda
              venda={editando}
              produtos={produtos}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditando(null);
              }}
            />
          )}
        </AnimatePresence>

        <ListaVendas 
          vendas={vendas}
          loading={loadingVendas}
          onEditar={handleEditar}
          onDeletar={handleDeletar}
        />

        <Pagination 
          meta={vendasData.meta} 
          onPageChange={(p) => setPage(p)} 
        />
      </div>
    </div>
  );
}