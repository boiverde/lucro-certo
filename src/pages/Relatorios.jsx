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

                {/* Bloco de Impacto Financeiro (O Tesouro Escondido) */}
                {resumo?.impactoFinanceiro > 0 && (
                    <div className="mb-8 bg-white border-2 border-indigo-100 p-8 rounded-[2rem] shadow-xl shadow-indigo-100/20 relative animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/30">
                                <TrendingUp className="w-10 h-10 text-white" />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h2 className="text-2xl font-black text-gray-900 mb-2">Impacto Financeiro Detectado</h2>
                                <p className="text-gray-500 text-lg">
                                    Você pode recuperar <span className="text-indigo-600 font-black">R$ {resumo.impactoFinanceiro.toFixed(2)}</span> este mês apenas corrigindo a precificação dos seus produtos.
                                </p>
                            </div>
                            <Button 
                                onClick={() => openUpgrade("Aumente seu lucro instantaneamente com a precificação automática.")}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 rounded-2xl font-bold text-lg h-auto shadow-lg shadow-indigo-600/20"
                            >
                                Recuperar Lucro Agora
                            </Button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Ranking de Lucro - O que está gerando DINHEIRO */}
                    <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white/80 backdrop-blur-sm">
                        <CardHeader className="border-b border-gray-100 py-6 px-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">Melhores Margens</CardTitle>
                                    <p className="text-xs text-gray-400 font-medium">Os produtos que mais contribuem com seu caixa</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="space-y-6">
                                {rankings?.maisLucrativos?.map((item, index) => (
                                    <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white transition-all hover:shadow-md border border-transparent hover:border-emerald-50">
                                        <div className="flex items-center gap-4">
                                            <span className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-xl text-xs font-black text-gray-400 border border-gray-100">{index + 1}</span>
                                            <div>
                                                <p className="text-base font-black text-gray-900 leading-tight">{item.nome}</p>
                                                <p className="text-xs text-emerald-600 font-bold">{item.margemMedia}% de margem real</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-gray-900">R$ {item.lucroTotal.toFixed(2)}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.quantidade} vendidos</p>
                                        </div>
                                    </div>
                                ))}

                                {isPartial && (
                                    <div className="mt-8 p-6 bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-[2rem] flex flex-col items-center gap-4 text-center">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-300 shadow-sm">
                                            <Lock className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-800">Desbloqueie o Sucesso</p>
                                            <p className="text-xs text-gray-500">Apenas o Top 3 está visível no plano gratuito.</p>
                                        </div>
                                        <Button 
                                            onClick={() => openUpgrade("Acesse os relatórios completos de performance.")}
                                            variant="secondary" 
                                            className="w-full font-bold h-12 rounded-xl bg-white shadow-sm border-gray-200"
                                        >
                                            Upgrade para visão completa
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Ranking de Alerta Crítico (Onde a Ação Acontece) */}
                    <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white/80 backdrop-blur-sm">
                        <CardHeader className="border-b border-gray-100 py-6 px-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">Ação Necessária</CardTitle>
                                    <p className="text-xs text-gray-400 font-medium">Produtos perdendo lucro ou com margem baixa</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="space-y-6">
                                {rankings?.alertaCritico?.length > 0 ? rankings.alertaCritico.map((item) => (
                                    <div key={item.id} className="p-5 rounded-3xl bg-rose-50/20 border border-rose-100/50 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-black text-rose-900 text-base">{item.nome}</h3>
                                                <p className="text-xs text-rose-700/80 font-bold">Perda de lucro detectada</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-gray-400 line-through">R$ {item.precoAtual.toFixed(2)}</p>
                                                <p className="text-xl font-black text-rose-600">R$ {item.precoSugerido.toFixed(2)}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-3 bg-white rounded-2xl shadow-sm border border-rose-100/30">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                                    <TrendingUp className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Ganho Potencial</p>
                                                    <p className="text-sm font-black text-emerald-600">+ R$ {item.ganhoPotencial.toFixed(2)}</p>
                                                </div>
                                            </div>
                                            <Button 
                                                size="sm"
                                                onClick={() => openUpgrade(`Aplique o preço sugerido de R$ ${item.precoSugerido.toFixed(2)} automaticamente com o Plano PRO.`)}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 rounded-xl shadow-sm shadow-emerald-600/20"
                                            >
                                                Aplicar Sugestão
                                            </Button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="h-48 flex flex-col items-center justify-center text-center opacity-40">
                                        <TrendingUp className="w-16 h-16 mb-4 text-emerald-600" />
                                        <p className="font-black text-gray-900">Operação Perfeita!</p>
                                        <p className="text-xs">Não detectamos produtos com margens críticas.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
}