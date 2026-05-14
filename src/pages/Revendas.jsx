import React, { useState, useEffect, useRef } from "react";
import { httpClient } from "@/api/httpClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Store, Users, DollarSign, Calendar, Wallet, Receipt } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatePresence } from "framer-motion";
import { format, addMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

import FormEmpresa from "../components/revendas/FormEmpresa";
import ListaEmpresas from "../components/revendas/ListaEmpresas";
import FormVendaRevenda from "../components/revendas/FormVendaRevenda";
import ListaVendasRevenda from "../components/revendas/ListaVendasRevenda";
import CalendarioPagamentos from "../components/revendas/CalendarioPagamentos";
import ListaPagamentos from "../components/revendas/ListaPagamentos";
import LembretePagamentos from "../components/revendas/LembretePagamentos";
import DetalhesVendaModal from "../components/revendas/DetalhesVendaModal";
import FormGastoRevenda from "../components/revendas/FormGastoRevenda";
import ListaGastosRevenda from "../components/revendas/ListaGastosRevenda";

export default function RevendasPage() {
  const [showFormEmpresa, setShowFormEmpresa] = useState(false);
  const [showFormVenda, setShowFormVenda] = useState(false);
  const [showFormGasto, setShowFormGasto] = useState(false);
  const [editandoEmpresa, setEditandoEmpresa] = useState(null);
  const [editandoVenda, setEditandoVenda] = useState(null);
  const [editandoGasto, setEditandoGasto] = useState(null);
  const [vendaSelecionada, setVendaSelecionada] = useState(null);
  const formVendaRef = useRef(null);
  const formEmpresaRef = useRef(null);
  const formGastoRef = useRef(null);

  const queryClient = useQueryClient();

  // Scroll para o formulário de venda quando ele aparecer ou mudar
  useEffect(() => {
    if (showFormVenda && formVendaRef.current) {
      setTimeout(() => {
        formVendaRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      }, 100);
    }
  }, [showFormVenda, editandoVenda]);

  // Scroll para o formulário de empresa quando ele aparecer ou mudar
  useEffect(() => {
    if (showFormEmpresa && formEmpresaRef.current) {
      setTimeout(() => {
        formEmpresaRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      }, 100);
    }
  }, [showFormEmpresa, editandoEmpresa]);

  // Scroll para o formulário de gasto quando ele aparecer ou mudar
  useEffect(() => {
    if (showFormGasto && formGastoRef.current) {
      setTimeout(() => {
        formGastoRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      }, 100);
    }
  }, [showFormGasto, editandoGasto]);

  const { data: empresas = [], isLoading: loadingEmpresas } = useQuery({
    queryKey: ['empresas-revenda'],
    queryFn: () => httpClient('/revendas/empresas'),
  });

  const { data: vendas = [], isLoading: loadingVendas } = useQuery({
    queryKey: ['vendas-revenda'],
    queryFn: () => httpClient('/revendas/vendas'),
  });

  const { data: gastos = [], isLoading: loadingGastos } = useQuery({
    queryKey: ['gastos-revenda'],
    queryFn: () => httpClient('/revendas/gastos'),
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => httpClient('/clientes'),
  });

  const createEmpresaMutation = useMutation({
    mutationFn: (data) => httpClient('/revendas/empresas', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresas-revenda'] });
      setShowFormEmpresa(false);
      setEditandoEmpresa(null);
    },
  });

  const updateEmpresaMutation = useMutation({
    mutationFn: ({ id, data }) => httpClient(`/revendas/empresas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresas-revenda'] });
      setShowFormEmpresa(false);
      setEditandoEmpresa(null);
    },
  });

  const createVendaMutation = useMutation({
    mutationFn: async (data) => {
      const nomeCliente = data.cliente.trim();

      // Verificar se o cliente já existe
      const clientesExistentes = await httpClient(`/clientes?nome=${encodeURIComponent(nomeCliente)}`);
      const lista = Array.isArray(clientesExistentes) ? clientesExistentes : (clientesExistentes?.data || []);

      if (lista.length === 0) {
        // Criar novo cliente
        await httpClient('/clientes', {
          method: 'POST',
          body: JSON.stringify({ nome: nomeCliente, ativo: true })
        });
      }

      // Criar a venda
      return httpClient('/revendas/vendas', { method: 'POST', body: JSON.stringify(data) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendas-revenda'] });
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      setShowFormVenda(false);
      setEditandoVenda(null);
    },
  });

  const updateVendaMutation = useMutation({
    mutationFn: ({ id, data }) => httpClient(`/revendas/vendas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendas-revenda'] });
      setShowFormVenda(false);
      setEditandoVenda(null);
    },
  });

  const deleteVendaMutation = useMutation({
    mutationFn: (id) => httpClient(`/revendas/vendas/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendas-revenda'] });
    },
  });

  const createGastoMutation = useMutation({
    mutationFn: (data) => httpClient('/revendas/gastos', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gastos-revenda'] });
      setShowFormGasto(false);
      setEditandoGasto(null);
    },
  });

  const updateGastoMutation = useMutation({
    mutationFn: ({ id, data }) => httpClient(`/revendas/gastos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gastos-revenda'] });
      setShowFormGasto(false);
      setEditandoGasto(null);
    },
  });

  const deleteGastoMutation = useMutation({
    mutationFn: (id) => httpClient(`/revendas/gastos/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gastos-revenda'] });
    },
  });

  const handleSubmitEmpresa = async (dados) => {
    if (editandoEmpresa) {
      updateEmpresaMutation.mutate({ id: editandoEmpresa.id, data: dados });
    } else {
      createEmpresaMutation.mutate(dados);
    }
  };

  const handleSubmitVenda = async (dados) => {
    if (editandoVenda) {
      updateVendaMutation.mutate({ id: editandoVenda.id, data: dados });
    } else {
      createVendaMutation.mutate(dados);
    }
  };

  const handleSubmitGasto = async (dados) => {
    if (editandoGasto) {
      updateGastoMutation.mutate({ id: editandoGasto.id, data: dados });
    } else {
      createGastoMutation.mutate(dados);
    }
  };

  const handleEditarEmpresa = (empresa) => {
    setEditandoEmpresa(null);
    setShowFormEmpresa(false);
    setTimeout(() => {
      setEditandoEmpresa(empresa);
      setShowFormEmpresa(true);
    }, 50);
  };

  const handleEditarVenda = (venda) => {
    setEditandoVenda(null);
    setShowFormVenda(false);
    setTimeout(() => {
      setEditandoVenda(venda);
      setShowFormVenda(true);
    }, 50);
  };

  const handleEditarGasto = (gasto) => {
    setEditandoGasto(null);
    setShowFormGasto(false);
    setTimeout(() => {
      setEditandoGasto(gasto);
      setShowFormGasto(true);
    }, 50);
  };

  const handleDeletarVenda = (venda) => {
    deleteVendaMutation.mutate(venda.id);
  };

  const handleDeletarGasto = (gasto) => {
    deleteGastoMutation.mutate(gasto.id);
  };

  const handleClickParcela = (venda) => {
    setVendaSelecionada(venda);
  };

  const clienteSelecionado = vendaSelecionada
    ? clientes.find(c => c.nome === vendaSelecionada.cliente)
    : null;

  // Calcular estatísticas
  const hoje = new Date();
  const inicioMes = startOfMonth(hoje);
  const fimMes = endOfMonth(hoje);

  const vendasMes = vendas.filter(v => {
    const dataCriacao = new Date(v.created_date);
    return isWithinInterval(dataCriacao, { start: inicioMes, end: fimMes }) && v.status !== 'cancelada';
  });

  const totalVendasMes = vendasMes.reduce((sum, v) => sum + v.valor_total, 0);

  const totalComissaoMes = vendas.reduce((total, venda) => {
    if (venda.status === 'cancelada' || !venda.numero_parcelas || venda.numero_parcelas === 0) return total;
    const comissaoPorParcela = venda.valor_comissao_total / venda.numero_parcelas;
    total += comissaoPorParcela * venda.parcelas_pagas;
    return total;
  }, 0);

  const comissoesAReceber = vendas.reduce((total, venda) => {
    if (venda.status === 'cancelada' || venda.status === 'paga') return total;
    if (!venda.numero_parcelas || venda.numero_parcelas === 0) return total;
    const parcelasRestantes = venda.numero_parcelas - venda.parcelas_pagas;
    const comissaoPorParcela = venda.numero_parcelas > 0 ? venda.valor_comissao_total / venda.numero_parcelas : 0;
    return total + (parcelasRestantes * comissaoPorParcela);
  }, 0);

  const vendasAtivas = vendas.filter(v => v.status === 'ativa').length;
  const empresasAtivas = empresas.filter(e => e.ativa).length;

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Revendas</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">
            Controle suas vendas de revenda (Natura, Boticário, Hinode, etc)
          </p>
        </div>

        <LembretePagamentos vendas={vendas} />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6">
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardHeader className="pb-2 pt-4 px-3 md:px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs md:text-sm font-medium opacity-90">Vendas Mês</CardTitle>
                <DollarSign className="h-4 w-4 opacity-90" />
              </div>
            </CardHeader>
            <CardContent className="px-3 md:px-4 pb-4">
              <div className="text-lg md:text-2xl font-bold">R$ {totalVendasMes.toFixed(2)}</div>
              <p className="text-xs opacity-90 mt-1">{vendasMes.length} vendas</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="pb-2 pt-4 px-3 md:px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs md:text-sm font-medium opacity-90">Comissão Recebida</CardTitle>
                <DollarSign className="h-4 w-4 opacity-90" />
              </div>
            </CardHeader>
            <CardContent className="px-3 md:px-4 pb-4">
              <div className="text-lg md:text-2xl font-bold">R$ {totalComissaoMes.toFixed(2)}</div>
              <p className="text-xs opacity-90 mt-1">Total acumulado</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
            <CardHeader className="pb-2 pt-4 px-3 md:px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs md:text-sm font-medium opacity-90">Comissões a Receber</CardTitle>
                <Wallet className="h-4 w-4 opacity-90" />
              </div>
            </CardHeader>
            <CardContent className="px-3 md:px-4 pb-4">
              <div className="text-lg md:text-2xl font-bold">R$ {comissoesAReceber.toFixed(2)}</div>
              <p className="text-xs opacity-90 mt-1">Total pendente</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
            <CardHeader className="pb-2 pt-4 px-3 md:px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs md:text-sm font-medium opacity-90">Empresas</CardTitle>
                <Store className="h-4 w-4 opacity-90" />
              </div>
            </CardHeader>
            <CardContent className="px-3 md:px-4 pb-4">
              <div className="text-lg md:text-2xl font-bold">{empresasAtivas}</div>
              <p className="text-xs opacity-90 mt-1">Ativas</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="vendas" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 h-auto">
            <TabsTrigger value="vendas" className="text-xs md:text-sm py-2">Vendas</TabsTrigger>
            <TabsTrigger value="pagamentos" className="text-xs md:text-sm py-2">Pagamentos</TabsTrigger>
            <TabsTrigger value="empresas" className="text-xs md:text-sm py-2">Empresas</TabsTrigger>
            <TabsTrigger value="calendario" className="text-xs md:text-sm py-2">Calendário</TabsTrigger>
            <TabsTrigger value="gastos" className="text-xs md:text-sm py-2">Gastos</TabsTrigger>
          </TabsList>

          <TabsContent value="vendas" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-lg md:text-xl font-bold">Minhas Vendas</h2>
              <Button
                onClick={() => { setEditandoVenda(null); setShowFormVenda(!showFormVenda); }}
                className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Nova Venda
              </Button>
            </div>

            <div ref={formVendaRef}>
              <AnimatePresence mode="wait">
                {showFormVenda && (
                  <FormVendaRevenda
                    key={editandoVenda?.id || 'novo'}
                    venda={editandoVenda}
                    empresas={empresas}
                    onSubmit={handleSubmitVenda}
                    onCancel={() => { setShowFormVenda(false); setEditandoVenda(null); }}
                  />
                )}
              </AnimatePresence>
            </div>

            <ListaVendasRevenda
              vendas={vendas}
              loading={loadingVendas}
              onEditar={handleEditarVenda}
              onDeletar={handleDeletarVenda}
            />
          </TabsContent>

          <TabsContent value="pagamentos" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg md:text-xl font-bold">Controle de Pagamentos</h2>
            </div>
            <ListaPagamentos vendas={vendas} />
          </TabsContent>

          <TabsContent value="empresas" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-lg md:text-xl font-bold">Empresas de Revenda</h2>
              <Button
                onClick={() => { setEditandoEmpresa(null); setShowFormEmpresa(!showFormEmpresa); }}
                className="bg-pink-600 hover:bg-pink-700 w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Nova Empresa
              </Button>
            </div>

            <div ref={formEmpresaRef}>
              <AnimatePresence mode="wait">
                {showFormEmpresa && (
                  <FormEmpresa
                    key={editandoEmpresa?.id || 'novo'}
                    empresa={editandoEmpresa}
                    onSubmit={handleSubmitEmpresa}
                    onCancel={() => { setShowFormEmpresa(false); setEditandoEmpresa(null); }}
                  />
                )}
              </AnimatePresence>
            </div>

            <ListaEmpresas
              empresas={empresas}
              loading={loadingEmpresas}
              onEditar={handleEditarEmpresa}
            />
          </TabsContent>

          <TabsContent value="calendario" className="space-y-6">
            <CalendarioPagamentos
              vendas={vendas}
              onClickParcela={handleClickParcela}
            />
          </TabsContent>

          <TabsContent value="gastos" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-lg md:text-xl font-bold">Gastos de Revenda</h2>
              <Button
                onClick={() => { setEditandoGasto(null); setShowFormGasto(!showFormGasto); }}
                className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Novo Gasto
              </Button>
            </div>

            <div ref={formGastoRef}>
              <AnimatePresence mode="wait">
                {showFormGasto && (
                  <FormGastoRevenda
                    key={editandoGasto?.id || 'novo'}
                    gasto={editandoGasto}
                    empresas={empresas}
                    gastosAnteriores={gastos}
                    onSubmit={handleSubmitGasto}
                    onCancel={() => { setShowFormGasto(false); setEditandoGasto(null); }}
                  />
                )}
              </AnimatePresence>
            </div>

            <ListaGastosRevenda
              gastos={gastos}
              loading={loadingGastos}
              onEditar={handleEditarGasto}
              onDeletar={handleDeletarGasto}
            />
          </TabsContent>
        </Tabs>
      </div>

      <DetalhesVendaModal
        venda={vendaSelecionada}
        cliente={clienteSelecionado}
        onClose={() => setVendaSelecionada(null)}
      />
    </div>
  );
}