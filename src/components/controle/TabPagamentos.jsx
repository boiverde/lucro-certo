import React, { useState } from "react";
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/api/httpClient";
import { Button } from "@/components/ui/button";
import { Plus, Calendar as CalendarIcon, DollarSign, Receipt, Users as UsersIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatePresence } from "framer-motion";

import FormGasto from "../gastos/FormGasto";
import ListaGastos from "../gastos/ListaGastos";
import FormFuncionario from "../funcionarios/FormFuncionario";
import ListaFuncionarios from "../funcionarios/ListaFuncionarios";
import FormDiaria from "../funcionarios/FormDiaria";
import ListaDiarias from "../funcionarios/ListaDiarias";
import PagamentosControle from "./PagamentosControle";
import CalendarioControle from "./CalendarioControle";

export default function TabPagamentos({ vendas, compras, isOnline, addToQueue }) {
  const [pagamentosTab, setPagamentosTab] = useState("calendario");
  const [funcionariosTab, setFuncionariosTab] = useState("diarias");
  const [showFormGasto, setShowFormGasto] = useState(false);
  const [editandoGasto, setEditandoGasto] = useState(null);
  const [showFormFuncionario, setShowFormFuncionario] = useState(false);
  const [editandoFuncionario, setEditandoFuncionario] = useState(null);
  const [showFormDiaria, setShowFormDiaria] = useState(false);
  const [editandoDiaria, setEditandoDiaria] = useState(null);
  const queryClient = useQueryClient();

  const { data: rawGastos, isLoading: loadingGastos } = useQuery({
    queryKey: ['gastos-operacionais'],
    queryFn: () => httpClient('/gastos-operacionais'),
  });

  const gastos = Array.isArray(rawGastos) ? rawGastos : (rawGastos?.results || []);

  const { data: rawFuncionarios, isLoading: loadingFuncionarios } = useQuery({
    queryKey: ['funcionarios'],
    queryFn: () => httpClient('/funcionarios'),
  });

  const funcionarios = Array.isArray(rawFuncionarios) ? rawFuncionarios : (rawFuncionarios?.results || []);

  const { data: rawDiarias, isLoading: loadingDiarias } = useQuery({
    queryKey: ['diarias'],
    queryFn: () => httpClient('/diarias'),
  });

  const diarias = Array.isArray(rawDiarias) ? rawDiarias : (rawDiarias?.results || []);

  // --- Gastos ---
  const createGastoMutation = useMutation({
    mutationFn: async (data) => {
      if (!isOnline) {
        addToQueue('create_gasto', data);
        throw new Error('offline');
      }

      if (data.tipo === 'diaria_funcionario' && data.funcionario) {
        const nomeFuncionario = data.funcionario.trim();
        const res = await httpClient(`/funcionarios?nome=${encodeURIComponent(nomeFuncionario)}`);
        const lista = Array.isArray(res) ? res : (res?.results || []);
        if (lista.length === 0) {
          await httpClient('/funcionarios', { method: 'POST', body: JSON.stringify({ nome: nomeFuncionario, ativo: true }) });
        }
      }

      return httpClient('/gastos-operacionais', { method: 'POST', body: JSON.stringify(data) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gastos-operacionais'] });
      queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
      setShowFormGasto(false);
      setEditandoGasto(null);
    },
    onError: (error) => {
      if (error.message === 'offline') {
        toast.success('Gasto salvo! Será sincronizado quando voltar online.', { id: 'gasto-offline' });
        setShowFormGasto(false);
        setEditandoGasto(null);
      }
    },
  });

  const updateGastoMutation = useMutation({
    mutationFn: ({ id, data }) => httpClient(`/gastos-operacionais/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gastos-operacionais'] });
      setShowFormGasto(false);
      setEditandoGasto(null);
    },
  });

  const deleteGastoMutation = useMutation({
    mutationFn: (id) => httpClient(`/gastos-operacionais/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gastos-operacionais'] }),
  });

  // --- Funcionários ---
  const createFuncionarioMutation = useMutation({
    mutationFn: async (data) => {
      if (!isOnline) {
        addToQueue('create_funcionario', data);
        throw new Error('offline');
      }
      return httpClient('/funcionarios', { method: 'POST', body: JSON.stringify(data) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
      setShowFormFuncionario(false);
      setEditandoFuncionario(null);
    },
    onError: (error) => {
      if (error.message === 'offline') {
        toast.success('Funcionário salvo! Será sincronizado quando voltar online.', { id: 'func-offline' });
        setShowFormFuncionario(false);
        setEditandoFuncionario(null);
      }
    },
  });

  const updateFuncionarioMutation = useMutation({
    mutationFn: ({ id, data }) => httpClient(`/funcionarios/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
      setShowFormFuncionario(false);
      setEditandoFuncionario(null);
    },
  });

  // --- Diárias ---
  const createDiariaMutation = useMutation({
    mutationFn: async (data) => {
      if (!isOnline) {
        addToQueue('create_diaria', data);
        throw new Error('offline');
      }

      const nomeFuncionario = data.funcionario_nome.trim();
      const res = await httpClient(`/funcionarios?nome=${encodeURIComponent(nomeFuncionario)}`);
      const lista = Array.isArray(res) ? res : (res?.results || []);

      let funcionarioId;
      if (lista.length === 0) {
        const novo = await httpClient('/funcionarios', { method: 'POST', body: JSON.stringify({ nome: nomeFuncionario, ativo: true }) });
        funcionarioId = novo.id;
      } else {
        funcionarioId = lista[0].id;
      }

      return httpClient('/diarias', { method: 'POST', body: JSON.stringify({ ...data, funcionario_id: funcionarioId }) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diarias'] });
      queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
      setShowFormDiaria(false);
      setEditandoDiaria(null);
    },
    onError: (error) => {
      if (error.message === 'offline') {
        toast.success('Diária salva! Será sincronizada quando voltar online.', { id: 'diaria-offline' });
        setShowFormDiaria(false);
        setEditandoDiaria(null);
      }
    },
  });

  const updateDiariaMutation = useMutation({
    mutationFn: ({ id, data }) => httpClient(`/diarias/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diarias'] });
      setShowFormDiaria(false);
      setEditandoDiaria(null);
    },
  });

  const deleteDiariaMutation = useMutation({
    mutationFn: (id) => httpClient(`/diarias/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['diarias'] }),
  });

  return (
    <Tabs value={pagamentosTab} onValueChange={setPagamentosTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="calendario">
          <CalendarIcon className="w-4 h-4 mr-2" />
          <span className="hidden md:inline">Calendário</span>
          <span className="md:hidden">Cal</span>
        </TabsTrigger>
        <TabsTrigger value="receber_pagar">
          <DollarSign className="w-4 h-4 mr-2" />
          <span className="hidden md:inline">A Receber/Pagar</span>
          <span className="md:hidden">R/P</span>
        </TabsTrigger>
        <TabsTrigger value="gastos">
          <Receipt className="w-4 h-4 mr-2" />
          <span className="hidden md:inline">Gastos</span>
          <span className="md:hidden">Gasto</span>
        </TabsTrigger>
        <TabsTrigger value="funcionarios">
          <UsersIcon className="w-4 h-4 mr-2" />
          <span className="hidden md:inline">Funcionários</span>
          <span className="md:hidden">Func</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="calendario">
        <CalendarioControle vendas={vendas} compras={compras} />
      </TabsContent>

      <TabsContent value="receber_pagar">
        <PagamentosControle vendas={vendas} compras={compras} />
      </TabsContent>

      {/* --- GASTOS --- */}
      <TabsContent value="gastos" className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 className="text-lg md:text-xl font-bold">Gastos Operacionais</h2>
          <Button onClick={() => { setEditandoGasto(null); setShowFormGasto(!showFormGasto); }} className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />Novo Gasto
          </Button>
        </div>
        <AnimatePresence mode="wait">
          {showFormGasto && (
            <FormGasto
              key={editandoGasto?.id || 'novo'}
              gasto={editandoGasto}
              onSubmit={(dados) => editandoGasto ? updateGastoMutation.mutate({ id: editandoGasto.id, data: dados }) : createGastoMutation.mutate(dados)}
              onCancel={() => { setShowFormGasto(false); setEditandoGasto(null); }}
            />
          )}
        </AnimatePresence>
        <ListaGastos
          gastos={gastos}
          loading={loadingGastos}
          onEditar={(g) => { setEditandoGasto(g); setShowFormGasto(true); }}
          onDeletar={(g) => deleteGastoMutation.mutate(g.id)}
        />
      </TabsContent>

      {/* --- FUNCIONÁRIOS / DIÁRIAS --- */}
      <TabsContent value="funcionarios" className="space-y-6">
        <Tabs value={funcionariosTab} onValueChange={setFuncionariosTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="diarias">Diárias</TabsTrigger>
            <TabsTrigger value="funcionarios">Funcionários</TabsTrigger>
          </TabsList>

          <TabsContent value="diarias" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-lg md:text-xl font-bold">Diárias</h2>
              <Button onClick={() => { setEditandoDiaria(null); setShowFormDiaria(!showFormDiaria); }} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />Nova Diária
              </Button>
            </div>
            <AnimatePresence mode="wait">
              {showFormDiaria && (
                <FormDiaria
                  key={editandoDiaria?.id || 'nova'}
                  diaria={editandoDiaria}
                  funcionarios={funcionarios}
                  onSubmit={(dados) => editandoDiaria ? updateDiariaMutation.mutate({ id: editandoDiaria.id, data: dados }) : createDiariaMutation.mutate(dados)}
                  onCancel={() => { setShowFormDiaria(false); setEditandoDiaria(null); }}
                />
              )}
            </AnimatePresence>
            <ListaDiarias
              diarias={diarias}
              loading={loadingDiarias}
              onEditar={(d) => { setEditandoDiaria(d); setShowFormDiaria(true); }}
              onDeletar={(d) => deleteDiariaMutation.mutate(d.id)}
              onMarcarPago={(d) => updateDiariaMutation.mutate({ id: d.id, data: { ...d, pago: true } })}
            />
          </TabsContent>

          <TabsContent value="funcionarios" className="space-y-6">
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                💡 <strong>Dica:</strong> Funcionários são criados automaticamente ao registrar uma diária ou gasto de funcionário. Use esta aba para adicionar telefone e observações.
              </p>
            </div>
            <AnimatePresence mode="wait">
              {showFormFuncionario && (
                <FormFuncionario
                  key={editandoFuncionario?.id || 'novo'}
                  funcionario={editandoFuncionario}
                  onSubmit={(dados) => editandoFuncionario ? updateFuncionarioMutation.mutate({ id: editandoFuncionario.id, data: dados }) : createFuncionarioMutation.mutate(dados)}
                  onCancel={() => { setShowFormFuncionario(false); setEditandoFuncionario(null); }}
                />
              )}
            </AnimatePresence>
            <ListaFuncionarios
              funcionarios={funcionarios}
              loading={loadingFuncionarios}
              onEditar={(f) => { setEditandoFuncionario(f); setShowFormFuncionario(true); }}
            />
          </TabsContent>
        </Tabs>
      </TabsContent>
    </Tabs>
  );
}

// Exporta os handlers de sync offline para uso no orquestrador
export async function syncPagamentos(item, queryClient) {
  if (item.type === 'create_gasto') {
    if (item.data.tipo === 'diaria_funcionario' && item.data.funcionario) {
      const nomeFuncionario = item.data.funcionario.trim();
      const res = await httpClient(`/funcionarios?nome=${encodeURIComponent(nomeFuncionario)}`);
      const lista = Array.isArray(res) ? res : (res?.results || []);
      if (lista.length === 0) {
        await httpClient('/funcionarios', { method: 'POST', body: JSON.stringify({ nome: nomeFuncionario, ativo: true }) });
      }
    }
    await httpClient('/gastos-operacionais', { method: 'POST', body: JSON.stringify(item.data) });
    queryClient.invalidateQueries({ queryKey: ['gastos-operacionais'] });
    queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
  } else if (item.type === 'create_funcionario') {
    await httpClient('/funcionarios', { method: 'POST', body: JSON.stringify(item.data) });
    queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
  } else if (item.type === 'create_diaria') {
    const nomeFuncionario = item.data.funcionario_nome.trim();
    const res = await httpClient(`/funcionarios?nome=${encodeURIComponent(nomeFuncionario)}`);
    const lista = Array.isArray(res) ? res : (res?.results || []);

    let funcionarioId;
    if (lista.length === 0) {
      const novo = await httpClient('/funcionarios', { method: 'POST', body: JSON.stringify({ nome: nomeFuncionario, ativo: true }) });
      funcionarioId = novo.id;
    } else {
      funcionarioId = lista[0].id;
    }

    await httpClient('/diarias', { method: 'POST', body: JSON.stringify({ ...item.data, funcionario_id: funcionarioId }) });
    queryClient.invalidateQueries({ queryKey: ['diarias'] });
    queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
  }
}
