import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { httpClient } from '@/api/httpClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    TrendingUp, 
    AlertTriangle, 
    Lightbulb, 
    ArrowRight, 
    Calendar,
    ChevronRight,
    Lock
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useUpgrade } from '@/context/UpgradeContext';

export default function Relatorios() {
    const [periodo, setPeriodo] = useState('mes'); // '7d', 'mes'
    const { openUpgrade } = useUpgrade();

    const from = periodo === '7d' ? format(subDays(new Date(), 7), 'yyyy-MM-dd') : format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd');
    const to = format(new Date(), 'yyyy-MM-dd');

    const { data, isLoading } = useQuery({
        queryKey: ['reports-performance', periodo],
        queryFn: async () => await httpClient(`/reports/performance?from=${from}&to=${to}`),
    });

    if (isLoading) {
        return (
            <div className="p-8 flex flex-col gap-6 animate-pulse">
                <div className="h-10 w-48 bg-gray-200 rounded"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Array(3).fill(0).map((_, i) => <div key={i} className="h-32 bg-gray-100 rounded-2xl"></div>)}
                </div>
            </div>
        );
    }

    const { rankings, insights, resumo, isPartial } = data || {};

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen pb-20">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Relatórios de Performance</h1>
                        <p className="text-gray-500 mt-1">Dados mastigados para você tomar decisões rápidas.</p>
                    </div>
                    
                    <div className="flex bg-white p-1 rounded-xl border border-gray-200 w-fit">
                        <button 
                            onClick={() => setPeriodo('7d')}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${periodo === '7d' ? 'bg-green-100 text-green-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            Últimos 7 dias
                        </button>
                        <button 
                            onClick={() => setPeriodo('mes')}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${periodo === 'mes' ? 'bg-green-100 text-green-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            Este Mês
                        </button>
                    </div>
                </div>

                {/* Bloco de Insight Rápido */}
                {insights && (
                    <div className="mb-8 bg-gradient-to-r from-green-600 to-green-700 p-6 rounded-3xl text-white shadow-xl shadow-green-600/20 relative overflow-hidden">
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                                <Lightbulb className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold mb-1">Insight do Lucro Certo</h2>
                                <p className="text-green-50/90 text-sm leading-relaxed">{insights.sugestao}</p>
                            </div>
                        </div>
                        <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Ranking de Lucro - O que está gerando DINHEIRO */}
                    <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                        <CardHeader className="bg-white border-b border-gray-100 py-5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Top Produtos (Lucro)</CardTitle>
                                    <p className="text-[10px] text-gray-400 font-medium">O que realmente paga as suas contas</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                {rankings?.maisLucrativos?.map((item, index) => (
                                    <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full text-[10px] font-bold text-gray-500">{index + 1}</span>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">{item.nome}</p>
                                                <p className="text-[10px] text-gray-400">{item.quantidade} unidades vendidas</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-green-600">R$ {item.lucroTotal.toFixed(2)}</p>
                                            <p className="text-[10px] font-bold text-gray-300">{item.margemMedia}% margem</p>
                                        </div>
                                    </div>
                                ))}

                                {isPartial && (
                                    <div className="mt-4 p-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center gap-3 text-center">
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-700">Acesso Parcial (Plano Free)</p>
                                            <p className="text-xs text-gray-400">Você está vendo apenas os 3 primeiros.</p>
                                        </div>
                                        <Button 
                                            onClick={() => openUpgrade("Desbloqueie o ranking completo de performance.")}
                                            variant="outline" 
                                            className="w-full text-xs font-bold gap-2 rounded-xl"
                                        >
                                            Ver Ranking Completo <ArrowRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                            <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                <p className="text-[11px] text-blue-700 leading-relaxed italic">
                                    <strong>Estratégia:</strong> Foque o marketing e promoções nestes produtos. Eles têm a melhor saúde financeira do seu estoque.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Ranking de Alerta - O que está QUEIMANDO caixa */}
                    <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                        <CardHeader className="bg-white border-b border-gray-100 py-5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Alerta de Prejuízo/Margem</CardTitle>
                                    <p className="text-[10px] text-gray-400 font-medium">Produtos que precisam de revisão urgente</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                {rankings?.alertaCritico?.length > 0 ? rankings.alertaCritico.map((item, index) => (
                                    <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl bg-red-50/30 border border-red-100/50">
                                        <div className="flex items-center gap-4">
                                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                            <div>
                                                <p className="text-sm font-bold text-red-900">{item.nome}</p>
                                                <p className="text-[10px] text-red-700 font-medium">
                                                    {item.lucroTotal < 0 ? 'Dando Prejuízo Real' : 'Margem muito baixa'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-red-600">
                                                {item.lucroTotal < 0 ? `- R$ ${Math.abs(item.lucroTotal).toFixed(2)}` : `${item.margemMedia}% margem`}
                                            </p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="h-40 flex flex-col items-center justify-center text-center opacity-40 grayscale">
                                        <TrendingUp className="w-12 h-12 mb-3" />
                                        <p className="text-xs font-bold">Nenhum produto em zona de alerta!</p>
                                        <p className="text-[10px]">Parabéns, sua precificação está saudável.</p>
                                    </div>
                                )}
                            </div>
                            <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                <p className="text-[11px] text-amber-700 leading-relaxed italic">
                                    <strong>Estratégia:</strong> Aumente o preço destes produtos ou reduza o custo de produção. Eles estão "vampirando" o seu lucro total.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
}