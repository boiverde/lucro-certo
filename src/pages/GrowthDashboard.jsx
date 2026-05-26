
import React, { useState, useEffect } from 'react';
import { httpClient } from '@/api/httpClient';
import { 
  TrendingUp, 
  Users, 
  Target, 
  DollarSign, 
  Zap, 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

export default function GrowthDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGrowthData = async () => {
            try {
                // Verificar se é admin antes de carregar dados sensíveis
                const me = await httpClient('/auth/me');
                if (me?.email !== 'admin@lucrocerto.com') {
                    setData({ accessDenied: true });
                    setLoading(false);
                    return;
                }
                // Consumindo o endpoint de inteligência de canal e funil
                const response = await httpClient('/analytics/funnel');
                setData(response);
            } catch (error) {
                console.error("Erro ao carregar dados de crescimento:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchGrowthData();
    }, []);

    if (data?.accessDenied) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <ShieldCheck className="w-16 h-16 text-gray-300" />
                <h2 className="text-xl font-bold text-gray-500">Acesso Restrito</h2>
                <p className="text-gray-400 text-sm">Esta página é exclusiva para administradores.</p>
            </div>
        );
    }

    if (loading) return (
        <div className="flex h-screen w-full items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    const channels = data?.channels || {};
    const unitEconomics = data?.unitEconomics || [];
    const liftStats = data?.liftStats || {};

    // Geração de Insights Automáticos (Parte D)
    const generateInsights = () => {
        const insights = [];
        
        // Melhor ROI de Canal
        const bestChannel = Object.entries(channels).sort((a, b) => b[1].paid - a[1].paid)[0];
        if (bestChannel) insights.push(`🚀 Canal ${bestChannel[0].toUpperCase()} tem o melhor volume de conversão PRO.`);

        // Melhor Segmento
        const bestSeg = Object.entries(liftStats).sort((a, b) => Number(b[1].B_rpv || 0) - Number(a[1].B_rpv || 0))[0];
        if (bestSeg) insights.push(`💎 Segmento ${bestSeg[0].toUpperCase()} gera o maior Valor por Usuário (RPV).`);

        // Alerta de Conversão
        const targetChannel = Object.entries(channels).find(c => (c[1].paid / (c[1].views || 1)) < 0.02);
        if (targetChannel) insights.push(`⚠️ Canal ${targetChannel[0].toUpperCase()} está com baixa conversão (< 2%).`);

        return insights;
    };

    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">GROWTH ENGINE</h1>
                    <p className="text-slate-500 font-medium">Auditoria de Aquisição e Unit Economics do Lucro Certo</p>
                </div>
                <div className="bg-indigo-600 text-white px-6 py-3 rounded-2xl shadow-lg shadow-indigo-100 flex items-center gap-3">
                    <TrendingUp className="w-5 h-5" />
                    <div className="text-right">
                        <p className="text-[10px] uppercase font-bold opacity-80 leading-none">Receita Incremental (Lift)</p>
                        <p className="text-xl font-black">R$ {data?.incrementalRevenue || '0,00'}</p>
                    </div>
                </div>
            </div>

            {/* Parte D: Insights Automáticos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {generateInsights().map((insight, i) => (
                    <div key={i} className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center gap-4 hover:border-indigo-200 transition-all cursor-default group">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <Zap className="w-5 h-5" />
                        </div>
                        <p className="text-sm font-bold text-slate-700">{insight}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Parte C.1: Aquisição por Canal */}
                <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 italic uppercase">
                            <Target className="w-5 h-5 text-indigo-500" /> Aquisição por Canal
                        </CardTitle>
                        <CardDescription>Performance detalhada por UTM Source</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-[10px] text-slate-400 uppercase font-black border-b border-slate-100">
                                        <th className="pb-4">Source</th>
                                        <th className="pb-4 text-center">Usuários</th>
                                        <th className="pb-4 text-center">Pagos</th>
                                        <th className="pb-4 text-center">Conversão</th>
                                        <th className="pb-4 text-right">Faturamento</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {Object.entries(channels).map(([source, stats]) => {
                                        const conv = (stats.paid / (stats.views || 1) * 100).toFixed(1);
                                        return (
                                            <tr key={source} className="group hover:bg-slate-50 transition-colors">
                                                <td className="py-4 font-black text-slate-800">{source.toUpperCase()}</td>
                                                <td className="py-4 text-center font-bold text-slate-600">{stats.views}</td>
                                                <td className="py-4 text-center font-bold text-green-600">{stats.paid}</td>
                                                <td className="py-4 text-center">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-black ${Number(conv) > 3 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                        {conv}%
                                                    </span>
                                                </td>
                                                <td className="py-4 text-right font-black text-slate-900">R$ {stats.revenue.toFixed(2)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Parte C.3: Unit Economics */}
                <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 italic uppercase">
                            <BarChart3 className="w-5 h-5 text-indigo-500" /> Unit Economics
                        </CardTitle>
                        <CardDescription>LTV, CAC Máximo e Payback por Segmento</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4">
                            {unitEconomics.map((u) => (
                                <div key={u.segment} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-black text-slate-900 uppercase italic flex items-center gap-2">
                                            <ShieldCheck className="w-4 h-4 text-indigo-500" /> 
                                            {u.segment} Tier
                                        </h3>
                                        <div className="text-right">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">ROI Efficiency</p>
                                            <p className="text-lg font-black text-indigo-600">{u.efficiency}x</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 leading-tight">LTV Est.</p>
                                            <p className="text-sm font-black text-slate-800 tracking-tight">R$ {u.ltv_real}</p>
                                        </div>
                                        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 leading-tight">CAC MAX (40%)</p>
                                            <p className="text-sm font-black text-green-600 tracking-tight">R$ {u.cac_max}</p>
                                        </div>
                                        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 leading-tight">Payback</p>
                                            <p className="text-sm font-black text-amber-600 tracking-tight">Instante</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Parte C.2: Receita e Performance */}
                <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 italic uppercase">
                            <DollarSign className="w-5 h-5 text-indigo-500" /> Receita & RPU
                        </CardTitle>
                        <CardDescription>Relação de valor gerado por visualização de oferta</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-6 bg-green-50 rounded-3xl border border-green-100">
                                <div>
                                    <h4 className="text-sm font-bold text-green-800 uppercase">RPU Médio</h4>
                                    <p className="text-3xl font-black text-green-900 leading-tight">R$ {data?.rpv || '0,00'}</p>
                                </div>
                                <div className="p-4 bg-white rounded-2xl shadow-sm">
                                    <ArrowUpRight className="text-green-600 w-8 h-8" />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2 leading-none">Mix Anual</h4>
                                    <p className="text-2xl font-black text-slate-800 leading-none">{data?.annualRate}%</p>
                                    <p className="text-[10px] text-indigo-600 font-bold mt-2 uppercase">Melhor LTV</p>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2 leading-none">Pagamentos Recuperados</h4>
                                    <p className="text-2xl font-black text-slate-800 leading-none">{data?.recovered}</p>
                                    <p className="text-[10px] text-green-600 font-bold mt-2 uppercase">Conversão Adicional</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Status de Confiança do Motor */}
                <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 italic uppercase">
                            <BarChart3 className="w-5 h-5 text-indigo-500" /> Confiança Estatística
                        </CardTitle>
                        <CardDescription>Monitoramento do tempo de teste A/B</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
                        <div className={`w-24 h-24 rounded-full border-8 flex items-center justify-center ${data?.ab_validity?.is_valid ? 'border-green-500 text-green-600' : 'border-amber-400 text-amber-600'}`}>
                             <p className="text-2xl font-black">{data?.ab_validity?.days_active}d</p>
                        </div>
                        <div className="text-center">
                            <p className="font-black text-slate-900 uppercase italic">
                                {data?.ab_validity?.is_valid ? 'Teste Ativo & Confiável' : 'Coletando Amostras'}
                            </p>
                            <p className="text-xs text-slate-400 font-medium">
                                {data?.ab_validity?.total_payments} de 200 pagamentos para significância total.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
