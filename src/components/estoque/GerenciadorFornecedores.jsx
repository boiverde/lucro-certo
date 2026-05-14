import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/api/httpClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Truck, Star, Edit, Trash2, Phone, Mail } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function GerenciadorFornecedores() {
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const queryClient = useQueryClient();

  const { data: fornecedores = [], isLoading } = useQuery({
    queryKey: ['fornecedores'],
    queryFn: () => httpClient('/fornecedores'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => httpClient(`/fornecedores/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fornecedores'] });
    },
  });

  const handleDeletar = (fornecedor) => {
    if (window.confirm(`Deletar fornecedor ${fornecedor.nome}?`)) {
      deleteMutation.mutate(fornecedor.id);
    }
  };

  const handleEditar = (fornecedor) => {
    setEditando(fornecedor);
    setShowForm(true);
  };

  const getAvaliacaoStars = (avaliacao) => {
    if (!avaliacao) return null;
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star key={i} className={`w-3 h-3 ${i <= avaliacao ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
        ))}
      </div>
    );
  };

  if (isLoading) return <div className="p-8">Carregando fornecedores...</div>;

  const fornecedoresAtivos = fornecedores.filter(f => f.ativo);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2"><Truck className="w-5 h-5" />Fornecedores</CardTitle>
              <p className="text-sm text-gray-500 mt-1">{fornecedoresAtivos.length} fornecedores ativos</p>
            </div>
            <Button onClick={() => { setEditando(null); setShowForm(true); }} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />Novo Fornecedor
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fornecedores.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-gray-500">Nenhum fornecedor cadastrado</div>
            ) : (
              fornecedores.map(fornecedor => (
                <Card key={fornecedor.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{fornecedor.nome}</h4>
                        {fornecedor.nome_fantasia && <p className="text-xs text-gray-500">{fornecedor.nome_fantasia}</p>}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditar(fornecedor)}><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeletar(fornecedor)} className="text-red-600"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      {fornecedor.telefone && (<div className="flex items-center gap-2 text-gray-600"><Phone className="w-3 h-3" /><span>{fornecedor.telefone}</span></div>)}
                      {fornecedor.email && (<div className="flex items-center gap-2 text-gray-600"><Mail className="w-3 h-3" /><span className="text-xs">{fornecedor.email}</span></div>)}
                      <div className="flex gap-2 mt-3">
                        {fornecedor.prazo_entrega_dias && (<Badge variant="outline" className="text-xs">{fornecedor.prazo_entrega_dias} dias entrega</Badge>)}
                        {fornecedor.avaliacao && (<div className="flex items-center gap-1">{getAvaliacaoStars(fornecedor.avaliacao)}</div>)}
                      </div>
                      {!fornecedor.ativo && <Badge className="bg-gray-500">Inativo</Badge>}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {showForm && (
          <FormFornecedor
            fornecedor={editando}
            onClose={() => { setShowForm(false); setEditando(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function FormFornecedor({ fornecedor, onClose }) {
  const [dados, setDados] = useState(fornecedor || {
    nome: "", nome_fantasia: "", cnpj: "", telefone: "", email: "",
    endereco: "", cidade: "", estado: "", contato_responsavel: "",
    prazo_entrega_dias: 7, pedido_minimo: "", avaliacao: "", ativo: true, observacoes: ""
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => httpClient('/fornecedores', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['fornecedores'] }); onClose(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => httpClient(`/fornecedores/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['fornecedores'] }); onClose(); },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const dadosCompletos = {
      ...dados,
      prazo_entrega_dias: parseInt(dados.prazo_entrega_dias) || 7,
      pedido_minimo: parseFloat(dados.pedido_minimo) || 0,
      avaliacao: dados.avaliacao ? parseInt(dados.avaliacao) : undefined
    };
    if (fornecedor) {
      updateMutation.mutate({ id: fornecedor.id, data: dadosCompletos });
    } else {
      createMutation.mutate(dadosCompletos);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{fornecedor ? 'Editar' : 'Novo'} Fornecedor</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Nome *</Label><Input value={dados.nome} onChange={(e) => setDados({...dados, nome: e.target.value})} required /></div>
            <div><Label>Nome Fantasia</Label><Input value={dados.nome_fantasia} onChange={(e) => setDados({...dados, nome_fantasia: e.target.value})} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>CNPJ</Label><Input value={dados.cnpj} onChange={(e) => setDados({...dados, cnpj: e.target.value})} placeholder="00.000.000/0000-00" /></div>
            <div><Label>Telefone *</Label><Input value={dados.telefone} onChange={(e) => setDados({...dados, telefone: e.target.value})} required /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Email</Label><Input type="email" value={dados.email} onChange={(e) => setDados({...dados, email: e.target.value})} /></div>
            <div><Label>Responsável</Label><Input value={dados.contato_responsavel} onChange={(e) => setDados({...dados, contato_responsavel: e.target.value})} placeholder="Nome do contato" /></div>
          </div>
          <div><Label>Endereço</Label><Input value={dados.endereco} onChange={(e) => setDados({...dados, endereco: e.target.value})} /></div>
          <div className="grid grid-cols-3 gap-4">
            <div><Label>Cidade</Label><Input value={dados.cidade} onChange={(e) => setDados({...dados, cidade: e.target.value})} /></div>
            <div><Label>Estado</Label><Input value={dados.estado} onChange={(e) => setDados({...dados, estado: e.target.value})} placeholder="UF" maxLength={2} /></div>
            <div><Label>Avaliação (1-5)</Label><Input type="number" min="1" max="5" value={dados.avaliacao} onChange={(e) => setDados({...dados, avaliacao: e.target.value})} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Prazo de Entrega (dias)</Label><Input type="number" value={dados.prazo_entrega_dias} onChange={(e) => setDados({...dados, prazo_entrega_dias: e.target.value})} /></div>
            <div><Label>Pedido Mínimo (R$)</Label><Input type="number" step="0.01" value={dados.pedido_minimo} onChange={(e) => setDados({...dados, pedido_minimo: e.target.value})} placeholder="0.00" /></div>
          </div>
          <div><Label>Observações</Label><Textarea value={dados.observacoes} onChange={(e) => setDados({...dados, observacoes: e.target.value})} rows={3} /></div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="ativo" checked={dados.ativo} onChange={(e) => setDados({...dados, ativo: e.target.checked})} className="w-4 h-4" />
            <Label htmlFor="ativo" className="cursor-pointer">Fornecedor ativo</Label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">{fornecedor ? 'Atualizar' : 'Criar'} Fornecedor</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}