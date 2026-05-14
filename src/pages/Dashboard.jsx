import React from "react";
import { httpClient } from "@/api/httpClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ShoppingCart, 
  TrendingUp, 
  Receipt, 
  DollarSign,
  Wallet,
  Store,
  CreditCard,
  ArrowRight
} from "lucide-react";

import ResumoLucro from "../components/dashboard/ResumoLucro";
import WelcomeMessage from "../components/dashboard/WelcomeMessage";
import RenewalNotice from "../components/dashboard/RenewalNotice";
import PainelEstoque from "../components/dashboard/PainelEstoque";
import UsageTracker from "../components/dashboard/UsageTracker";
import LucratividadeBanner from "../components/dashboard/LucratividadeBanner";
import { useUpgrade } from "@/context/UpgradeContext";

export default function Dashboard() {
  const { pendingPix, openUpgrade } = useUpgrade();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user-me'],
    queryFn: async () => await httpClient('/auth/me'),
    staleTime: 1000 * 60 * 30,
  });

  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats', user?.email],
    queryFn: async () => await httpClient('/dashboard/stats'),
    enabled: !!user?.email,
    staleTime: 1000 * 60 * 5,
  });

  const transacoes = dashboardStats?.transacoes || {};
  const totalVendasMes = transacoes.totalVendas || 0;
  const totalComprasMes = transacoes.totalCompras || 0;
  const totalGastosMes = transacoes.totalGastos || 0;
  
  const comissoesMes = dashboardStats?.comissoes?.comissoesDoMes || 0;
  const lucroBrutoMes = totalVendasMes + comissoesMes - totalComprasMes - totalGastosMes;
  const hasData = (transacoes.contagens?.vendas > 0) || (transacoes.contagens?.compras > 0);

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">Painel de Controle</h1>
          <p className="text-sm text-gray-500 mt-1">
            {userLoading ? "Carregando perfil..." : `Olá, ${user?.full_name || 'Usuário'}! Acompanhe seu desempenho hoje.`}
          </p>
        </div>

        {!userLoading && (
          <div className="space-y-6">
            <WelcomeMessage user={user} hasData={hasData} />
            <RenewalNotice user={user} stats={dashboardStats} />
            
            {pendingPix && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-3xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-amber-900 tracking-tight">Pagamento Pendente</p>
                    <p className="text-[10px] text-amber-700 font-medium">Libere os recursos PRO agora.</p>
                  </div>
                </div>
                <Button 
                  onClick={() => openUpgrade("Retome o pagamento PRO.")}
                  variant="ghost"
                  className="text-amber-700 hover:bg-amber-100 font-black text-[10px] uppercase gap-2"
                >
                  Concluir <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            )}

            <LucratividadeBanner stats={dashboardStats} isLoading={statsLoading} />
            <UsageTracker usage={dashboardStats?.usage} isLoading={statsLoading} />

            {/* Grid de Métricas Rápidas */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-indigo-600 text-white border-none rounded-[2rem] shadow-lg shadow-indigo-100/50">
                <CardHeader className="pb-2 pt-6 px-6 flex flex-row items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Vendas</span>
                  <TrendingUp className="h-4 w-4 opacity-70" />
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="text-xl font-black">R$ {(totalVendasMes || 0).toFixed(2)}</div>
                </CardContent>
              </Card>

              <Card className="bg-rose-500 text-white border-none rounded-[2rem] shadow-lg shadow-rose-100/50">
                <CardHeader className="pb-2 pt-6 px-6 flex flex-row items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Compras</span>
                  <ShoppingCart className="h-4 w-4 opacity-70" />
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="text-xl font-black">R$ {(totalComprasMes || 0).toFixed(2)}</div>
                </CardContent>
              </Card>

              <Card className="bg-amber-500 text-white border-none rounded-[2rem] shadow-lg shadow-amber-100/50">
                <CardHeader className="pb-2 pt-6 px-6 flex flex-row items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Gastos</span>
                  <Receipt className="h-4 w-4 opacity-70" />
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="text-xl font-black">R$ {(totalGastosMes || 0).toFixed(2)}</div>
                </CardContent>
              </Card>

              <Card className={`${lucroBrutoMes >= 0 ? 'bg-emerald-500' : 'bg-rose-600'} text-white border-none rounded-[2rem] shadow-lg`}>
                <CardHeader className="pb-2 pt-6 px-6 flex flex-row items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{lucroBrutoMes >= 0 ? 'Lucro' : 'Prejuízo'}</span>
                  <DollarSign className="h-4 w-4 opacity-70" />
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="text-xl font-black">R$ {(Math.abs(lucroBrutoMes) || 0).toFixed(2)}</div>
                </CardContent>
              </Card>
            </div>

            {/* Painel de Comissões e Estoque */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border-none shadow-sm rounded-3xl bg-white p-6">
                <CardHeader className="p-0 mb-4 flex flex-row justify-between items-center">
                  <CardTitle className="text-sm font-black text-gray-400 uppercase tracking-widest">Caixa e Comissões</CardTitle>
                </CardHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Este Mês</p>
                    <p className="text-lg font-black text-slate-700">R$ {(comissoesMes || 0).toFixed(2)}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">A Receber</p>
                    <p className="text-lg font-black text-slate-700">R$ {(dashboardStats?.comissoes?.comissoesAReceber || 0).toFixed(2)}</p>
                  </div>
                </div>
              </Card>
              <PainelEstoque stats={dashboardStats?.estoque} />
            </div>

            <ResumoLucro 
              vendasTotal={totalVendasMes}
              comprasTotal={totalComprasMes}
              gastosTotal={totalGastosMes}
              comissoesTotal={comissoesMes}
            />
          </div>
        )}
      </div>
    </div>
  );
}