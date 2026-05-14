import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/api/httpClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Package, AlertTriangle, Calendar, Trash2, Edit } from "lucide-react";
import { format, differenceInDays, parseISO, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function GerenciadorLotes() {
  const [showForm, setShowForm] = useState(false);
  const [editandoLote, setEditandoLote] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const queryClient = useQueryClient();

  const { data: lotes = [], isLoading } = useQuery({
    queryKey: ['lotes'],
    queryFn: () => httpClient('/lotes'),
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => httpClient('/produtos'),
  });

  const { data: ingredientes = [] } = useQuery({
    queryKey: ['ingredientes'],
    queryFn: () => httpClient('/ingredientes'),
  });

  const { data: fornecedores = [] } = useQuery({
    queryKey: ['fornecedores'],
    queryFn: () => httpClient('/fornecedores'),
  });

  const deleteLoteMutation = useMutation({
    mutationFn: (id) => httpClient(`/lotes/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lotes'] });
    },
  });

  const handleDeletar = (lote) => {
    if (window.confirm(`Deletar lote ${lote.codigo_lote}?`)) {
      deleteLoteMutation.mutate(lote.id);
    }
  };

  const handleEditar = (lote) => {
    setEditandoLote(lote);
    setShowForm(true);
  };

  const lotesFiltrados = lotes.filter(lote => {
    const tipoMatch = filtroTipo === "todos" || lote.tipo === filtroTipo;
    const statusMatch = filtroStatus === "todos" || lote.status === filtroStatus;
    return tipoMatch && statusMatch;
  });

  const hoje = new Date();
  const lotesVencidos = lotesFiltrados.filter(l =>
    l.data_validade && isBefore(parseISO(l.data_validade), hoje)
  );
  const lotesVencendo = lotesFiltrados.filter(l => {
    if (!l.data_validade) return false;
    const dias = differenceInDays(parseISO(l.data_validade), hoje);
    return dias >= 0 && dias <= 30;
  });

  const getStatusColor = (status) => {
    const colors = {
      disponivel: "bg-green-100 text-green-800",
      parcial: "bg-yellow-100 text-yellow-800",
      esgotado: "bg-gray-100 text-gray-800",
      vencido: "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status) => {
    const labels = {
      disponivel: "Disponível",
      parcial: "Parcial",
      esgotado: "Esgotado",
      vencido: "Vencido"
    };
    return labels[status] || status;
  };

  const getValidadeColor = (dataValidade) => {
    if (!dataValidade) return "text-gray-500";
    const dias = differenceInDays(parseISO(dataValidade), hoje);
    if (dias < 0) return "text-red-600";
    if (dias <= 7) return "text-red-500";
    if (dias <= 30) return "text-orange-500";
    return "text-gray-700";
  };

  if (isLoading) {
    return <div className="p-8">Carregando lotes...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Alertas de validade */}
      {(lotesVencidos.length > 0 || lotesVencendo.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lotesVencidos.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-red-700">
                  <AlertTriangle className="w-4 h-4" />
                  {lotesVencidos.length} Lote(s) Vencido(s)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {lotesVencidos.slice(0, 3).map(lote => (
                    <p key={lote.id} className="text-xs text-red-700">
                      • {lote.produto_nome} - {lote.codigo_lote}
                    </p>
                  ))}
                  {lotesVencidos.length > 3 && (
                    <p className="text-xs text-red-600">+ {lotesVencidos.length - 3} outros</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {lotesVencendo.length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-orange-700">
                  <Calendar className="w-4 h-4" />
                  {lotesVencendo.length} Lote(s) Vencendo em 30 dias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {lotesVencendo.slice(0, 3).map(lote => (
                    <p key={lote.id} className="text-xs text-orange-700">
                      • {lote.produto_nome} - {differenceInDays(parseISO(lote.data_validade), hoje)} dias
                    </p>
                  ))}
                  {lotesVencendo.length > 3 && (
                    <p className="text-xs text-orange-600">+ {lotesVencendo.length - 3} outros</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Filtros e ações */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Controle de Lotes
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                {lotesFiltrados.length} lotes cadastrados
              </p>
            </div>
            <Button onClick={() => { setEditandoLote(null); setShowForm(true); }} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Lote
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 mb-4">
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                <SelectItem value="produto">Produtos</SelectItem>
                <SelectItem value="ingrediente">Ingredientes</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="disponivel">Disponível</SelectItem>
                <SelectItem value="parcial">Parcial</SelectItem>
                <SelectItem value="esgotado">Esgotado</SelectItem>
                <SelectItem value="vencido">Vencido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {lotesFiltrados.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum lote cadastrado
              </div>
            ) : (
              lotesFiltrados.map(lote => {
                const diasValidade = lote.data_validade ? differenceInDays(parseISO(lote.data_validade), hoje) : null;

                return (
                  <Card key={lote.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{lote.produto_nome}</h4>
                            <Badge className={getStatusColor(lote.status)}>{getStatusLabel(lote.status)}</Badge>
                            <Badge variant="outline">{lote.tipo}</Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                            <div>
                              <p className="text-gray-500">Código</p>
                              <p className="font-medium">{lote.codigo_lote}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Quantidade</p>
                              <p className="font-medium">{lote.quantidade} {lote.unidade}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Validade</p>
                              <p className={`font-medium ${getValidadeColor(lote.data_validade)}`}>
                                {lote.data_validade ? format(parseISO(lote.data_validade), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}
                                {diasValidade !== null && diasValidade >= 0 && (
                                  <span className="text-xs ml-1">({diasValidade}d)</span>
                                )}
                              </p>
                            </div>
                            {lote.fornecedor_nome && (
                              <div>
                                <p className="text-gray-500">Fornecedor</p>
                                <p className="font-medium text-xs">{lote.fornecedor_nome}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditar(lote)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeletar(lote)} className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {showForm && (
          <FormLote
            lote={editandoLote}
            produtos={produtos}
            ingredientes={ingredientes}
            fornecedores={fornecedores}
            onClose={() => {
              setShowForm(false);
              setEditandoLote(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function FormLote({ lote, produtos, ingredientes, fornecedores, onClose }) {
  const [dados, setDados] = useState(lote || {
    tipo: "produto",
    codigo_lote: `L${new Date().getFullYear()}${String(Date.now()).slice(-4)}`,
    quantidade: "",
    unidade: "kg",
    data_fabricacao: format(new Date(), 'yyyy-MM-dd'),
    data_validade: "",
    valor_unitario: "",
    status: "disponivel",
    localizacao: "",
    observacoes: ""
  });

  const queryClient = useQueryClient();

  const createLoteMutation = useMutation({
    mutationFn: (data) => httpClient('/lotes', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lotes'] });
      onClose();
    },
  });

  const updateLoteMutation = useMutation({
    mutationFn: ({ id, data }) => httpClient(`/lotes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lotes'] });
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const item = dados.tipo === "produto"
      ? produtos.find(p => p.id === dados.produto_id)
      : ingredientes.find(i => i.id === dados.produto_id);

    const fornecedor = fornecedores.find(f => f.id === dados.fornecedor_id);

    const dadosCompletos = {
      ...dados,
      produto_nome: item?.nome || "",
      fornecedor_nome: fornecedor?.nome || "",
      quantidade: parseFloat(dados.quantidade),
      valor_unitario: parseFloat(dados.valor_unitario) || 0
    };

    if (lote) {
      updateLoteMutation.mutate({ id: lote.id, data: dadosCompletos });
    } else {
      createLoteMutation.mutate(dadosCompletos);
    }
  };

  const itensDisponiveis = dados.tipo === "produto" ? produtos : ingredientes;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{lote ? 'Editar' : 'Novo'} Lote</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tipo *</Label>
              <Select value={dados.tipo} onValueChange={(v) => setDados({...dados, tipo: v, produto_id: ""})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="produto">Produto</SelectItem>
                  <SelectItem value="ingrediente">Ingrediente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Código do Lote *</Label>
              <Input
                value={dados.codigo_lote}
                onChange={(e) => setDados({...dados, codigo_lote: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <Label>{dados.tipo === "produto" ? "Produto" : "Ingrediente"} *</Label>
            <Select value={dados.produto_id} onValueChange={(v) => setDados({...dados, produto_id: v})}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {itensDisponiveis.map(item => (
                  <SelectItem key={item.id} value={item.id}>{item.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Quantidade *</Label>
              <Input type="number" step="0.001" value={dados.quantidade} onChange={(e) => setDados({...dados, quantidade: e.target.value})} required />
            </div>
            <div>
              <Label>Unidade</Label>
              <Input value={dados.unidade} onChange={(e) => setDados({...dados, unidade: e.target.value})} placeholder="kg, unidades, etc" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data de Fabricação</Label>
              <Input type="date" value={dados.data_fabricacao} onChange={(e) => setDados({...dados, data_fabricacao: e.target.value})} />
            </div>
            <div>
              <Label>Data de Validade *</Label>
              <Input type="date" value={dados.data_validade} onChange={(e) => setDados({...dados, data_validade: e.target.value})} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Valor Unitário</Label>
              <Input type="number" step="0.01" value={dados.valor_unitario} onChange={(e) => setDados({...dados, valor_unitario: e.target.value})} placeholder="0.00" />
            </div>
            <div>
              <Label>Fornecedor</Label>
              <Select value={dados.fornecedor_id} onValueChange={(v) => setDados({...dados, fornecedor_id: v})}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {fornecedores.map(f => (
                    <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              <Select value={dados.status} onValueChange={(v) => setDados({...dados, status: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="disponivel">Disponível</SelectItem>
                  <SelectItem value="parcial">Parcial</SelectItem>
                  <SelectItem value="esgotado">Esgotado</SelectItem>
                  <SelectItem value="vencido">Vencido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Localização</Label>
              <Input value={dados.localizacao} onChange={(e) => setDados({...dados, localizacao: e.target.value})} placeholder="Ex: Geladeira 1, Prateleira A" />
            </div>
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea value={dados.observacoes} onChange={(e) => setDados({...dados, observacoes: e.target.value})} rows={3} />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {lote ? 'Atualizar' : 'Criar'} Lote
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}