import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/api/httpClient";
import { Plus, ShoppingCart, TrendingUp, Package, DollarSign } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

import OfflineManager, { useOffline } from "../components/mobile/OfflineManager";
import TabVendas, { syncVendas } from "../components/controle/TabVendas";
import TabCompras, { syncCompras } from "../components/controle/TabCompras";
import TabLanches from "../components/controle/TabLanches";
import TabPagamentos, { syncPagamentos } from "../components/controle/TabPagamentos";
import TabEstoque, { syncEstoque } from "../components/controle/TabEstoque";

export default function ControlePage() {
  const [activeTab, setActiveTab] = useState("vendas");
  const queryClient = useQueryClient();
  const { isOnline, addToQueue } = useOffline();

  // Queries compartilhadas — usadas apenas para os badges de resumo no topo
  // O TanStack Query desuplica: os mesmos queryKeys nos filhos reutilizam o cache
  const { data: vendasData } = useQuery({
    queryKey: ['vendas'],
    queryFn: () => httpClient('/vendas'),
  });

  const { data: comprasData } = useQuery({
    queryKey: ['compras'],
    queryFn: () => httpClient('/compras'),
  });

  const { data: produtosQueryData } = useQuery({
    queryKey: ['produtos', 1],
    queryFn: () => httpClient('/produtos?page=1&limit=50'),
  });

  // Normalização de dados (suporta array direto ou objeto paginado { results: [] })
  const vendas = Array.isArray(vendasData) ? vendasData : (vendasData?.results || []);
  const compras = Array.isArray(comprasData) ? comprasData : (comprasData?.results || []);
  const produtos = Array.isArray(produtosQueryData) ? produtosQueryData : (produtosQueryData?.results || produtosQueryData?.data || []);
  
  const produtosAtivos = produtos.filter(p => p.ativo);
  const produtosComEstoqueBaixo = produtos.filter(
    p => p.ativo && p.estoque_atual <= p.estoque_minimo && p.estoque_minimo > 0
  );

  // Handler unificado de sincronização offline — delega para cada tab
  const handleSync = async (item) => {
    try {
      if (item.type === 'create_venda') {
        await syncVendas(item, queryClient);
      } else if (item.type === 'create_compra') {
        await syncCompras(item, queryClient);
      } else if (['create_gasto', 'create_funcionario', 'create_diaria'].includes(item.type)) {
        await syncPagamentos(item, queryClient);
      } else if (['create_produto', 'create_movimentacao'].includes(item.type)) {
        await syncEstoque(item, queryClient);
      }
    } catch (err) {
      console.error('Erro ao sincronizar item offline:', err);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <OfflineManager onSync={handleSync} />

      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Controle</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">
            Gerencie vendas, compras, estoque e pagamentos
          </p>
        </div>

        {/* Badges de resumo */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Badge variant="outline" className="flex items-center gap-1 whitespace-nowrap">
            <TrendingUp className="w-3 h-3" />{vendas.length} Vendas
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 whitespace-nowrap">
            <ShoppingCart className="w-3 h-3" />{compras.length} Compras
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 whitespace-nowrap">
            <Package className="w-3 h-3" />{produtosAtivos.length} Produtos
          </Badge>
          {produtosComEstoqueBaixo.length > 0 && (
            <Badge className="bg-orange-100 text-orange-800 flex items-center gap-1 whitespace-nowrap">
              <AlertTriangle className="w-3 h-3" />{produtosComEstoqueBaixo.length} Baixo
            </Badge>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 h-auto">
            <TabsTrigger value="vendas" className="text-xs md:text-sm py-2">
              <TrendingUp className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Vendas</span>
              <span className="sm:hidden">Venda</span>
            </TabsTrigger>
            <TabsTrigger value="compras" className="text-xs md:text-sm py-2">
              <ShoppingCart className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Compras</span>
              <span className="sm:hidden">Compra</span>
            </TabsTrigger>
            <TabsTrigger value="lanches" className="text-xs md:text-sm py-2">
              🍕<span className="hidden sm:inline ml-2">Lanches</span>
              <span className="sm:hidden ml-1">Lanch</span>
            </TabsTrigger>
            <TabsTrigger value="pagamentos" className="text-xs md:text-sm py-2">
              <DollarSign className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Pagamentos</span>
              <span className="sm:hidden">Pag</span>
            </TabsTrigger>
            <TabsTrigger value="estoque" className="text-xs md:text-sm py-2">
              <Package className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Estoque</span>
              <span className="sm:hidden">Estoq</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vendas" className="space-y-6">
            <TabVendas
              produtos={produtosAtivos}
              isOnline={isOnline}
              addToQueue={addToQueue}
            />
          </TabsContent>

          <TabsContent value="compras" className="space-y-6">
            <TabCompras
              produtos={produtosAtivos}
              isOnline={isOnline}
              addToQueue={addToQueue}
            />
          </TabsContent>

          <TabsContent value="lanches" className="space-y-6">
            <TabLanches
              produtos={produtosAtivos}
              isOnline={isOnline}
              addToQueue={addToQueue}
            />
          </TabsContent>

          <TabsContent value="pagamentos" className="space-y-6">
            <TabPagamentos
              vendas={vendas}
              compras={compras}
              isOnline={isOnline}
              addToQueue={addToQueue}
            />
          </TabsContent>

          <TabsContent value="estoque" className="space-y-6">
            <TabEstoque
              isOnline={isOnline}
              addToQueue={addToQueue}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}