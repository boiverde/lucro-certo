import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { httpClient } from "@/api/httpClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ShoppingCart, 
  TrendingUp, 
  Receipt, 
  DollarSign,
  Package,
  Users,
  Fuel,
  Utensils,
  Store,
  Wallet,
  Globe,
  Smartphone
} from "lucide-react";
import { format, startOfMonth, endOfMonth, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

import ResumoLucro from "../components/dashboard/ResumoLucro";
import UltimasTransacoes from "../components/dashboard/UltimasTransacoes";
import WelcomeMessage from "../components/dashboard/WelcomeMessage";
import BannerAcessoWeb from "../components/dashboard/BannerAcessoWeb";
import PainelEstoque from "../components/dashboard/PainelEstoque";
import UsageTracker from "../components/dashboard/UsageTracker";
import LucratividadeBanner from "../components/dashboard/LucratividadeBanner";
import RenewalNotice from "../components/dashboard/RenewalNotice";

const hoje = new Date();
const inicioMesObj = startOfMonth(hoje);
const fimMesObj = endOfMonth(hoje);
const inicioMesStr = format(inicioMesObj, "yyyy-MM-dd");
const fimMesStr = format(fimMesObj, "yyyy-MM-dd");

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.log('Erro ao carregar usuário');
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const { data: compras = [] } = useQuery({
    queryKey: ['compras', user?.email],
    queryFn: async () => {
      // Optimizado: busca apenas do mês atual no banco
      return await base44.entities.Compra.filter({ 
        created_by: user.email,
        data_inicio: inicioMesStr,
        data_fim: fimMesStr
      }, '-data_compra');
    },
    enabled: !!user?.email && !loading,
  });

  const { data: vendas = [] } = useQuery({
    queryKey: ['vendas', user?.email],
    queryFn: async () => {
      return await base44.entities.Venda.filter({ 
        created_by: user.email,
        data_inicio: inicioMesStr,
        data_fim: fimMesStr
      }, '-data_venda');
    },
    enabled: !!user?.email && !loading,
  });

  const { data: gastos = [] } = useQuery({
    queryKey: ['gastos', user?.email],
    queryFn: async () => {
      return await base44.entities.GastoOperacional.filter({ 
        created_by: user.email,
        data_inicio: inicioMesStr,
        data_fim: fimMesStr
      }, '-data');
    },
    enabled: !!user?.email && !loading,
  });

  const { data: dashboardStats } = useQuery({
    queryKey: ['dashboard-stats', user?.email],
    queryFn: async () => {
      return await httpClient('/dashboard/stats');
    },
    enabled: !!user?.email && !loading,
  });

  const { data: vendasRevenda = [] } = useQuery({
    queryKey: ['vendas-revenda-dashboard', user?.email],
    queryFn: async () => {
      // Limite para Últimas Transações e ResumoLucro
      return await base44.entities.VendaRevenda.filter({ created_by: user.email, limit: 10 }, '-data_primeira_parcela');
    },
    enabled: !!user?.email && !loading,
  });

  // Como já filtramos no backend, e a querystring filtra por data_venda (compras, vendas, gastos),
  // as arrays principais são virtualmente apenas do mês atual. 
  // Removendo o filtro cliente-side pra evitar varredura em N elementos.
  const comprasMes = compras;
  const vendasMes = vendas;
  const gastosMes = gastos;

  // Usa o stats delegado ao banco para O(1) fetch ao em vez de map client-side
  const comissoesDoMes = dashboardStats?.comissoes?.comissoesDoMes || 0;
  const comissoesAReceber = dashboardStats?.comissoes?.comissoesAReceber || 0;

  const totalComprasMes = comprasMes.reduce((sum, c) => sum + c.valor_total, 0);
  const totalVendasMes = vendasMes.reduce((sum, v) => sum + v.valor_total, 0);
  const totalGastosMes = gastosMes.reduce((sum, g) => sum + g.valor, 0);
  
  // CORRIGIDO: Lucro líquido = Vendas + Comissões - Compras - Gastos
  const lucroBrutoMes = totalVendasMes + comissoesDoMes - totalComprasMes - totalGastosMes;

  const gastosAlimentacao = gastosMes.filter(g => g.tipo === 'alimentacao').reduce((sum, g) => sum + g.valor, 0);
  const gastosGasolina = gastosMes.filter(g => g.tipo === 'gasolina').reduce((sum, g) => sum + g.valor, 0);
  const gastosDiarias = gastosMes.filter(g => g.tipo === 'diaria_funcionario').reduce((sum, g) => sum + g.valor, 0);

  const hasData = compras.length > 0 || vendas.length > 0 || gastos.length > 0 || vendasRevenda.length > 0;

  if (loading || !user) {
    return (
      <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">
            Bem-vindo, {user?.full_name || 'Usuário'}!
          </p>
        </div>

        <WelcomeMessage user={user} hasData={hasData} />
        <RenewalNotice user={user} stats={dashboardStats} />
        <LucratividadeBanner stats={dashboardStats} />
        <UsageTracker usage={dashboardStats?.usage} />

        <BannerAcessoWeb />

        {/* Cards de Resumo - Mobile Optimized */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs md:text-sm font-medium opacity-90">Vendas</CardTitle>
                <TrendingUp className="h-4 w-4 opacity-90" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-xl md:text-2xl font-bold">R$ {totalVendasMes.toFixed(2)}</div>
              <p className="text-xs opacity-90 mt-1">
                {vendasMes.length} vendas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs md:text-sm font-medium opacity-90">Compras</CardTitle>
                <ShoppingCart className="h-4 w-4 opacity-90" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-xl md:text-2xl font-bold">R$ {totalComprasMes.toFixed(2)}</div>
              <p className="text-xs opacity-90 mt-1">
                {comprasMes.length} compras
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs md:text-sm font-medium opacity-90">Gastos</CardTitle>
                <Receipt className="h-4 w-4 opacity-90" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-xl md:text-2xl font-bold">R$ {totalGastosMes.toFixed(2)}</div>
              <p className="text-xs opacity-90 mt-1">
                {gastosMes.length} gastos
              </p>
            </CardContent>
          </Card>

          <Card className={`${lucroBrutoMes >= 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-purple-500 to-purple-600'} text-white`}>
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs md:text-sm font-medium opacity-90">
                  {lucroBrutoMes >= 0 ? 'Lucro' : 'Prejuízo'}
                </CardTitle>
                <DollarSign className="h-4 w-4 opacity-90" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-xl md:text-2xl font-bold">R$ {Math.abs(lucroBrutoMes).toFixed(2)}</div>
              <p className="text-xs opacity-90 mt-1">
                {lucroBrutoMes >= 0 ? 'Positivo' : 'Negativo'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Cards de Comissões */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm md:text-base font-medium opacity-90">Comissões do Mês</CardTitle>
                <Wallet className="h-5 w-5 opacity-90" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl md:text-3xl font-bold">R$ {comissoesDoMes.toFixed(2)}</div>
              <p className="text-xs opacity-90 mt-1">Parcelas pagas este mês</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm md:text-base font-medium opacity-90">Comissões a Receber</CardTitle>
                <Store className="h-5 w-5 opacity-90" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl md:text-3xl font-bold">R$ {comissoesAReceber.toFixed(2)}</div>
              <p className="text-xs opacity-90 mt-1">Total de parcelas pendentes</p>
            </CardContent>
          </Card>
        </div>

        {/* Painel de Estoque */}
        <PainelEstoque stats={dashboardStats?.estoque} />

        {/* Cards de Gastos Específicos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Alimentação</CardTitle>
              <Utensils className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">R$ {gastosAlimentacao.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Gasolina</CardTitle>
              <Fuel className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">R$ {gastosGasolina.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Diárias</CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">R$ {gastosDiarias.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ResumoLucro 
              compras={compras}
              vendas={vendas}
              gastos={gastos}
              vendasRevenda={vendasRevenda}
            />
          </div>
          <div>
            <UltimasTransacoes 
              compras={compras}
              vendas={vendas}
              gastos={gastos}
              vendasRevenda={vendasRevenda}
            />
          </div>
        </div>
      </div>
    </div>
  );
}