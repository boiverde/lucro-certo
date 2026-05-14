import React, { useState, useEffect } from "react";
import { httpClient } from "@/api/httpClient";
import { keepPreviousData, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

import FormCliente from "../components/clientes/FormCliente";
import ListaClientes from "../components/clientes/ListaClientes";
import HistoricoCliente from "../components/clientes/HistoricoCliente";
import Pagination from "@/components/ui/pagination";

export default function ClientesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [page, setPage] = useState(1);

  const queryClient = useQueryClient();

  const { data: clientesData = { data: [], meta: null }, isLoading: loadingClientes } = useQuery({
    queryKey: ['clientes', page],
    queryFn: () => httpClient(`/clientes?page=${page}&limit=50`),
    placeholderData: keepPreviousData,
  });

  const clientes = Array.isArray(clientesData) ? clientesData : (clientesData.data || []);
  const meta = Array.isArray(clientesData) ? null : clientesData.meta;

  const { data: vendasRevendaRaw = {} } = useQuery({
    queryKey: ['vendas-revenda-clientes'],
    queryFn: () => httpClient('/revendas/vendas'),
  });

  const vendasRevenda = Array.isArray(vendasRevendaRaw) ? vendasRevendaRaw : (vendasRevendaRaw?.results || []);

  const createClienteMutation = useMutation({
    mutationFn: (data) => httpClient('/clientes', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      setShowForm(false);
      setEditando(null);
    },
  });

  const updateClienteMutation = useMutation({
    mutationFn: ({ id, data }) => httpClient(`/clientes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      setShowForm(false);
      setEditando(null);
    },
  });

  const deleteClienteMutation = useMutation({
    mutationFn: (id) => httpClient(`/clientes/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });

  const handleSubmit = async (dados) => {
    if (editando) {
      updateClienteMutation.mutate({ id: editando.id, data: dados });
    } else {
      createClienteMutation.mutate(dados);
    }
  };

  const handleEditar = (cliente) => {
    setEditando(cliente);
    setShowForm(true);
    setClienteSelecionado(null);
  };

  const handleVerHistorico = (cliente) => {
    setClienteSelecionado(cliente);
    setShowForm(false);
    setEditando(null);
  };

  const handleDeletar = (cliente) => {
    deleteClienteMutation.mutate(cliente.id);
  };

  const clientesAtivos = clientes.filter(c => c.ativo).length;
  const clientesComVendas = new Set(vendasRevenda.map(v => v.cliente)).size;
  const totalVendas = vendasRevenda.length;

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">Gerencie seus clientes e acompanhe o histórico de vendas</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white"><CardHeader className="pb-2 pt-4 px-3 md:px-4"><div className="flex items-center justify-between"><CardTitle className="text-xs md:text-sm font-medium opacity-90">Total Clientes</CardTitle><Users className="h-4 w-4 opacity-90" /></div></CardHeader><CardContent className="px-3 md:px-4 pb-4"><div className="text-lg md:text-2xl font-bold">{clientes.length}</div><p className="text-xs opacity-90 mt-1">{clientesAtivos} ativos</p></CardContent></Card>
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white"><CardHeader className="pb-2 pt-4 px-3 md:px-4"><div className="flex items-center justify-between"><CardTitle className="text-xs md:text-sm font-medium opacity-90">Com Vendas</CardTitle><Users className="h-4 w-4 opacity-90" /></div></CardHeader><CardContent className="px-3 md:px-4 pb-4"><div className="text-lg md:text-2xl font-bold">{clientesComVendas}</div><p className="text-xs opacity-90 mt-1">Clientes ativos</p></CardContent></Card>
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white"><CardHeader className="pb-2 pt-4 px-3 md:px-4"><div className="flex items-center justify-between"><CardTitle className="text-xs md:text-sm font-medium opacity-90">Total Vendas</CardTitle><Users className="h-4 w-4 opacity-90" /></div></CardHeader><CardContent className="px-3 md:px-4 pb-4"><div className="text-lg md:text-2xl font-bold">{totalVendas}</div><p className="text-xs opacity-90 mt-1">Todas as vendas</p></CardContent></Card>
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white"><CardHeader className="pb-2 pt-4 px-3 md:px-4"><div className="flex items-center justify-between"><CardTitle className="text-xs md:text-sm font-medium opacity-90">Média/Cliente</CardTitle><Users className="h-4 w-4 opacity-90" /></div></CardHeader><CardContent className="px-3 md:px-4 pb-4"><div className="text-lg md:text-2xl font-bold">{clientesComVendas > 0 ? (totalVendas / clientesComVendas).toFixed(1) : '0'}</div><p className="text-xs opacity-90 mt-1">Vendas por cliente</p></CardContent></Card>
        </div>

        <Tabs defaultValue="lista" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger value="lista" className="text-xs md:text-sm py-2">Lista de Clientes</TabsTrigger>
            <TabsTrigger value="historico" className="text-xs md:text-sm py-2" disabled={!clienteSelecionado}>
              Histórico
              {clienteSelecionado && (<Badge variant="secondary" className="ml-2">{clienteSelecionado.nome.split(' ')[0]}</Badge>)}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lista" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-lg md:text-xl font-bold">Meus Clientes</h2>
              <Button onClick={() => { setShowForm(!showForm); setClienteSelecionado(null); }} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                <Plus className="w-4 h-4 md:w-5 md:h-5 mr-2" />Novo Cliente
              </Button>
            </div>

            <AnimatePresence>
              {showForm && (
                <FormCliente
                  cliente={editando}
                  onSubmit={handleSubmit}
                  onCancel={() => { setShowForm(false); setEditando(null); }}
                />
              )}
            </AnimatePresence>

            <ListaClientes
              clientes={clientes}
              loading={loadingClientes}
              onEditar={handleEditar}
              onVerHistorico={handleVerHistorico}
              onDeletar={handleDeletar}
            />

            <Pagination meta={meta} onPageChange={(p) => setPage(p)} />
          </TabsContent>

          <TabsContent value="historico" className="space-y-6">
            {clienteSelecionado && (
              <HistoricoCliente
                cliente={clienteSelecionado}
                vendas={vendasRevenda.filter(v => v.cliente === clienteSelecionado.nome)}
                onVoltar={() => setClienteSelecionado(null)}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}