import React, { useState, useEffect } from "react";
import { handleApiError } from '@/api/errorHandler';
import { toast } from 'sonner';
import { httpClient } from "@/api/httpClient";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AnimatePresence } from "framer-motion";

import FormCompra from "../components/compras/FormCompra";
import ListaCompras from "../components/compras/ListaCompras";

export default function ComprasPage() {
  const [compras, setCompras] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarCompras();
  }, []);

  const carregarCompras = async () => {
    setLoading(true);
    try {
      const data = await httpClient('/compras');
      setCompras(Array.isArray(data) ? data : (data?.data || []));
    } catch (error) {
      handleApiError(error, 'carregar suas compras');
      console.error('Erro ao carregar compras:', error);
    }
    setLoading(false);
  };

  const handleSubmit = async (dados) => {
    try {
      if (editando) {
        await httpClient(`/compras/${editando.id}`, {
          method: 'PUT',
          body: JSON.stringify(dados)
        });
      } else {
        await httpClient('/compras', {
          method: 'POST',
          body: JSON.stringify(dados)
        });
      }
      setShowForm(false);
      setEditando(null);
      carregarCompras();
    } catch (error) {
      handleApiError(error, 'salvar compra');
    }
  };

  const handleEditar = (compra) => {
    setEditando(compra);
    setShowForm(true);
  };

  const handleDeletar = async (compra) => {
    try {
      await httpClient(`/compras/${compra.id}`, { method: 'DELETE' });
      carregarCompras();
    } catch (error) {
      handleApiError(error, 'deletar compra');
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Compras</h1>
            <p className="text-gray-500 mt-1">Gerencie suas compras de produtos</p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nova Compra
          </Button>
        </div>

        <AnimatePresence>
          {showForm && (
            <FormCompra
              compra={editando}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditando(null);
              }}
            />
          )}
        </AnimatePresence>

        <ListaCompras 
          compras={compras}
          loading={loading}
          onEditar={handleEditar}
          onDeletar={handleDeletar}
        />
      </div>
    </div>
  );
}