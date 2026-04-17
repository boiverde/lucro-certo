import React, { useState, useEffect } from "react";
import { handleApiError } from '@/api/errorHandler';
import { toast } from 'sonner';
import { GastoPessoal } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AnimatePresence } from "framer-motion";

import FormGastoPessoal from "../components/pessoais/FormGastoPessoal";
import ListaGastosPessoais from "../components/pessoais/ListaGastosPessoais";

export default function PessoaisPage() {
  const [gastos, setGastos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    carregarGastos();
  }, []);

  const carregarGastos = async () => {
    setLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      const data = await GastoPessoal.filter({ created_by: currentUser.email }, '-data');
      setGastos(data);
    } catch (error) {
      handleApiError(error, 'carregar os gastos pessoais')
      handleApiError(error, 'carregar os gastos pessoais')
      console.error('Erro ao carregar gastos pessoais:', error);
    }
    setLoading(false);
  };

  const handleSubmit = async (dados) => {
    if (editando) {
      await GastoPessoal.update(editando.id, dados);
    } else {
      await GastoPessoal.create(dados);
    }
    setShowForm(false);
    setEditando(null);
    carregarGastos();
  };

  const handleEditar = (gasto) => {
    setEditando(gasto);
    setShowForm(true);
  };

  const handleDeletar = async (gasto) => {
    await GastoPessoal.delete(gasto.id);
    carregarGastos();
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gastos Pessoais</h1>
            <p className="text-gray-500 mt-1">Controle seus gastos pessoais diários: aluguel, mercado, gasolina, etc.</p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Gasto Pessoal
          </Button>
        </div>

        <AnimatePresence>
          {showForm && (
            <FormGastoPessoal
              gasto={editando}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditando(null);
              }}
            />
          )}
        </AnimatePresence>

        <ListaGastosPessoais 
          gastos={gastos}
          loading={loading}
          onEditar={handleEditar}
          onDeletar={handleDeletar}
        />
      </div>
    </div>
  );
}