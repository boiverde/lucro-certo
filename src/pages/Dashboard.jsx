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
import { useUpgrade } from "@/context/UpgradeContext";
import { CreditCard, ArrowRight } from "lucide-react";

const hoje = new Date();
const inicioMesObj = startOfMonth(hoje);
const fimMesObj = endOfMonth(hoje);
const inicioMesStr = format(inicioMesObj, "yyyy-MM-dd");
const fimMesStr = format(fimMesObj, "yyyy-MM-dd");

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { pendingPix, openUpgrade } = useUpgrade();

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

  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats', user?.email],
    queryFn: async () => {
      return await httpClient('/dashboard/stats');
    },
    enabled: !!user?.email && !loading,
    staleTime: 1000 * 60 * 5, // Mantém os dados zerados por 5 minutos enquanto navega
    cacheTime: 1000 * 60 * 30, // Mantém no cache por 30 minutos
  });

  const { data: vendasRevenda = [] } = useQuery({
    queryKey: ['vendas-revenda-dashboard', user?.email],
    queryFn: async () => {
      return await base44.entities.VendaRevenda.filter({ created_by: user.email, limit: 10 }, '-data_primeira_parcela');
    },
    enabled: !!user?.email && !loading,
    staleTime: 1000 * 60 * 5,
  });

  // Dados unificados do backend otimizado
  const transacoes = dashboardStats?.transacoes || {};
  const totalVendasMes = transacoes.totalVendas || 0;
  const totalComprasMes = transacoes.totalCompras || 0;
  const totalGastosMes = transacoes.totalGastos || 0;
  
  const lucroBrutoMes = totalVendasMes + (dashboardStats?.comissoes?.comissoesDoMes || 0) - totalComprasMes - totalGastosMes;

  const { alimentacao, gasolina, diarias } = transacoes.detalhesGastos || { alimentacao: 0, gasolina: 0, diarias: 0 };

  const hasData = (transacoes.contagens?.vendas > 0) || (transacoes.contagens?.compras > 0) || (transacoes.contagens?.gastos > 0);

  if (loading || statsLoading || !user) {
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
        
        {pendingPix && new Date(pendingPix.expiresAt) > new Date() && (
          <div className="mb-6 bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between gap-4 animate-in slide-in-from-top duration-500">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-900">Você tem um pagamento pendente</p>
                <p className="text-[10px] text-amber-700 font-medium">Finalize sua assinatura PRO para liberar todos os recursos.</p>
              </div>
            </div>
            <Button 
              onClick={() => openUpgrade("Retome o pagamento da sua assinatura PRO.")}
              className="h-9 px-4 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl gap-2 shadow-lg shadow-amber-600/20"
            >
              Concluir Pagamento <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}

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
                {transacoes.contagens?.vendas || 0} vendas
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
                {transacoes.contagens?.compras || 0} compras
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
                {transacoes.contagens?.gastos || 0} gastos
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
              <div className="text-2xl md:text-3xl font-bold">R$ {(dashboardStats?.comissoes?.comissoesDoMes || 0).toFixed(2)}</div>
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
              <div className="text-2xl md:text-3xl font-bold">R$ {(dashboardStats?.comissoes?.comissoesAReceber || 0).toFixed(2)}</div>
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
              <div className="text-2xl font-bold text-orange-600">R$ {alimentacao.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Gasolina</CardTitle>
              <Fuel className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">R$ {gasolina.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Diárias</CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">R$ {diarias.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ResumoLucro 
              compras={transacoes.recentes?.compras || []}
              vendas={transacoes.recentes?.vendas || []}
              gastos={transacoes.recentes?.gastos || []}
              vendasRevenda={vendasRevenda}
            />
          </div>
          <div>
            <UltimasTransacoes 
              compras={transacoes.recentes?.compras || []}
              vendas={transacoes.recentes?.vendas || []}
              gastos={transacoes.recentes?.gastos || []}
              vendasRevenda={vendasRevenda}
            />
          </div>
        </div>
      </div>
    </div>
  );
}