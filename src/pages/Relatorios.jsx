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
    Lock,
    DollarSign
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useUpgrade } from '@/context/UpgradeContext';

export default function Relatorios() {
    const [periodo, setPeriodo] = useState('mes'); // '7d', 'mes'
    const { openUpgrade } = useUpgrade();
    const { data: userData } = useQuery({
        queryKey: ['user-me'],
        queryFn: async () => await httpClient('/auth/me'),
    });

    const [margemAlvo, setMargemAlvo] = useState(userData?.margem_lucro_padrao || 30);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const from = periodo === '7d' ? format(subDays(new Date(), 7), 'yyyy-MM-dd') : format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd');
    const to = format(new Date(), 'yyyy-MM-dd');

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['reports-performance', periodo, margemAlvo, canal],
        queryFn: async () => await httpClient(`/reports/performance?from=${from}&to=${to}&canal=${canal}`),
    });

    const updateMargem = async (novaMargem) => {
        setMargemAlvo(novaMargem);
        const fieldMap = {
            balcao: 'margem_balcao',
            delivery: 'margem_delivery',
            marketplace: 'margem_marketplace'
        };
        await httpClient('/auth/me', {
            method: 'PATCH',
            body: JSON.stringify({ [fieldMap[canal]]: novaMargem })
        });
        refetch();
    };

    const handleApplySuggestion = async () => {
        if (!selectedProduct) return;
        setIsUpdating(true);
        try {
            await httpClient(`/produtos/${selectedProduct.id}`, {
                method: 'PUT',
                body: JSON.stringify({ 
                    preco: selectedProduct.precoSugerido,
                    margem_prevista: selectedProduct.margemAlvo,
                    margem_realizada: selectedProduct.margemMedia,
                    canal: canal 
                })
            });
            setSelectedProduct(null);
            refetch();
        } catch (error) {
            console.error('Erro ao atualizar preço');
        } finally {
            setIsUpdating(false);
        }
    };

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

    const { rankings, resumo, isPartial } = data || {};

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen pb-20">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">Métricas de Margem</h1>
                        <p className="text-gray-500 mt-1">Sintonize sua meta por canal e recupere seu lucro.</p>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                        {/* Seletor de Canal */}
                        <div className="flex bg-gray-200/50 p-1 rounded-xl border border-gray-200 self-end">
                            {['balcao', 'delivery', 'marketplace'].map(c => (
                                <button 
                                    key={c}
                                    onClick={() => setCanal(c)}
                                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${canal === c ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:bg-white/50'}`}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                                {[20, 30, 40, 50].map(m => (
                                    <button 
                                        key={m}
                                        onClick={() => updateMargem(m)}
                                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${margemAlvo === m ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
                                    >
                                        {m}%
                                    </button>
                                ))}
                            </div>

                            <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                                <button 
                                    onClick={() => setPeriodo('7d')}
                                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${periodo === '7d' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-400 hover:bg-gray-50'}`}
                                >
                                    7 DIAS
                                </button>
                                <button 
                                    onClick={() => setPeriodo('mes')}
                                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${periodo === 'mes' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-400 hover:bg-gray-50'}`}
                                >
                                    MÊS ATUAL
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* Faturamento */}
                    <Card className="rounded-[2rem] border-none shadow-lg shadow-indigo-100/20 bg-indigo-600 text-white p-8">
                        <div className="flex justify-between items-start mb-4">
                            <DollarSign className="w-8 h-8 opacity-40" />
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Faturamento</span>
                        </div>
                        <h3 className="text-3xl font-black">R$ {resumo?.faturamento?.toFixed(2)}</h3>
                    </Card>

                    {/* Confronto de Custo Fixo */}
                    <Card className="rounded-[2rem] border-none shadow-lg shadow-indigo-100/20 bg-white p-8 group relative overflow-hidden">
                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <div className="flex justify-between items-start mb-4">
                                <TrendingUp className="w-8 h-8 text-indigo-600 opacity-40" />
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Custo Fixo Real vs Proj.</span>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between items-end">
                                    <h3 className={`text-2xl font-black ${resumo?.gastosOperacionaisReais > resumo?.gastosOperacionaisProjetados ? 'text-rose-600' : 'text-emerald-600'}`}>
                                        R$ {resumo?.gastosOperacionaisReais?.toFixed(2)}
                                    </h3>
                                    <span className="text-xs font-bold text-gray-400">Proj: R$ {resumo?.gastosOperacionaisProjetados?.toFixed(2)}</span>
                                </div>
                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full transition-all duration-1000 ${resumo?.gastosOperacionaisReais > (resumo?.gastosOperacionaisProjetados || 0) ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                        style={{ width: `${Math.min((resumo?.gastosOperacionaisReais / (resumo?.gastosOperacionaisProjetados || 1)) * 100 || 0, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Governança Total v1.9 */}
                    <Card className="rounded-[2rem] border-none shadow-lg shadow-indigo-100/20 bg-white p-8 overflow-hidden relative group">
                        <div className="flex justify-between items-start mb-4">
                            <ShieldAlert className="w-8 h-8 text-indigo-600 opacity-40" />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Governança v1.9</span>
                        </div>
                        <h3 className="text-3xl font-black text-gray-900">{resumo?.volumeReferencia} <span className="text-sm text-gray-400 font-bold">Vendas/Ciclo</span></h3>
                        
                        {!resumo?.governança?.robustez ? (
                            <div className="flex items-center gap-2 mt-4 py-2 px-4 bg-amber-50 rounded-2xl w-fit border border-amber-100">
                                <AlertCircle className="w-4 h-4 text-amber-500" />
                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-wider italic">Amostra Frágil ({resumo?.governança?.diasAmostra} dias)</p>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 mt-4 py-1.5 px-3 bg-indigo-50 rounded-xl border border-indigo-100 w-fit">
                                <Activity className="w-3 h-3 text-indigo-600" />
                                <p className="text-[9px] font-black text-indigo-600 uppercase tracking-tight italic">Dados Robustos Verificados</p>
                            </div>
                        )}
                    </Card>

                    {/* Ganho Realista (Range) */}
                    <Card className="rounded-[2rem] border-none shadow-lg shadow-emerald-100/20 bg-emerald-600 p-8 group relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                            <PieChart className="w-8 h-8 text-white opacity-40" />
                            <span className="text-[10px] font-black text-emerald-100 uppercase tracking-widest">Lucro Realista Projetado</span>
                        </div>
                        <div className="space-y-1">
                            {(() => {
                                const ganhoOtimista = rankings?.detalhado?.reduce((acc, p) => acc + (Number(p.ganhoUnitario || 0) * p.quantidade), 0) || 0;
                                const ganhoRealista = ganhoOtimista * 0.85;
                                return (
                                    <>
                                        <h3 className="text-2xl font-black text-white">
                                            R$ {ganhoRealista.toFixed(0)} ~ {ganhoOtimista.toFixed(0)}
                                        </h3>
                                        <p className="text-[10px] font-black text-emerald-200 uppercase tracking-tighter italic">Projeção com atrito operacional</p>
                                    </>
                                )
                            })()}
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-[0.1] group-hover:scale-110 transition-transform">
                            <TrendingUp className="w-32 h-32 text-white" />
                        </div>
                    </Card>

                    {/* D-Day Blindado */}
                    <Card className="rounded-[2rem] border-none shadow-lg shadow-indigo-100/20 bg-white p-8 group relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                                <Clock className="w-8 h-8 text-indigo-600 opacity-40" />
                                <div className="text-[8px] font-black px-1.5 py-0.5 rounded-full border bg-slate-50 border-slate-200 text-slate-500 uppercase tracking-tighter">
                                    CV {resumo?.governança?.CV}
                                </div>
                            </div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Previsão Blindada</span>
                        </div>
                        <div className="space-y-1">
                            {resumo?.dDayRange !== "Equilibrado" ? (
                                <>
                                    <h3 className="text-3xl font-black text-gray-900">{resumo.dDayRange}</h3>
                                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter italic">Meta de equilíbrio de caixa</p>
                                </>
                            ) : (
                                <h3 className="text-2xl font-black text-emerald-600 uppercase italic">Caixa Saudável</h3>
                            )}
                        </div>
                    </Card>
                    
                </div>

                {resumo?.impactoFinanceiro > 0 && (
                    <div className="mb-8 bg-white border-2 border-indigo-100 p-8 rounded-[2rem] shadow-xl shadow-indigo-100/20 relative overflow-hidden group">
                        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                            <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/30">
                                <TrendingUp className="w-10 h-10 text-white" />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h2 className="text-2xl font-black text-gray-900 mb-2">Potencial de Ganho Rápido</h2>
                                <p className="text-gray-500 text-lg">
                                    Corrija <span className="font-black text-gray-800">{rankings?.alertaCritico?.length || 0} produtos</span> e ganhe <span className="text-emerald-600 font-black">+R$ {resumo.impactoFinanceiro.toFixed(2)}</span> este mês.
                                </p>
                            </div>
                            <Button 
                                onClick={() => openUpgrade("Recupere seu lucro total instantaneamente com precificação de massa.")}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 rounded-2xl font-bold text-lg h-auto shadow-lg shadow-indigo-600/20"
                            >
                                Aplicar tudo (PRO)
                            </Button>
                        </div>
                        <div className="absolute right-0 bottom-0 opacity-[0.03] pointer-events-none">
                            <DollarSign className="w-64 h-64 -mb-20 -mr-20" />
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white/80 backdrop-blur-sm border border-white">
                        <CardHeader className="border-b border-gray-100 py-6 px-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">Orgulho do Caixa</CardTitle>
                                    <p className="text-xs text-gray-400 font-medium">Produtos operando na meta de {margemAlvo}%</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="space-y-6">
                                {rankings?.maisLucrativos?.map((item, index) => (
                                    <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white transition-all hover:shadow-md border border-transparent">
                                        <div className="flex items-center gap-4">
                                            <span className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-xl text-xs font-black text-gray-400 border border-gray-100">{index + 1}</span>
                                            <div>
                                                <p className="text-base font-black text-gray-900 leading-tight">{item.nome}</p>
                                                <p className="text-xs text-emerald-600 font-bold">{item.margemMedia}% de lucro real</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-gray-900">R$ {item.lucroTotal.toFixed(2)}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.quantidade} vendidos</p>
                                        </div>
                                    </div>
                                ))}
                                {isPartial && (
                                    <Button onClick={() => openUpgrade("Ver ranking completo.")} variant="secondary" className="w-full rounded-2xl">Ver Mais (PRO)</Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Radar Financeiro Algorítmico v1.3 */}
                    <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white/80 backdrop-blur-sm border border-white">
                        <CardHeader className="border-b border-gray-100 py-6 px-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">Radar Financeiro</CardTitle>
                                    <p className="text-xs text-gray-400 font-medium tracking-tight">Estabilidade sugerida (Clamp 5%) no canal {canal?.toUpperCase()}</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="space-y-6">
                                {rankings?.detalhado?.filter(p => p.margemMedia < 25).slice(0, isPartial ? 2 : 10).map((item) => {
                                    // Executar o Motor v1.3 no Frontend
                                    const suggestion = calculatePriceSuggestion(item.custoBase, userData, canal, item.deltaRaw);
                                    const isCritical = suggestion?.zona === 'CRÍTICA';

                                    return (
                                        <div key={item.id} className="p-6 rounded-[2rem] bg-gray-50/50 border border-gray-100 space-y-4 relative overflow-hidden group hover:bg-white transition-all">
                                            <div className={`absolute top-0 right-0 w-2 h-full ${isCritical ? 'bg-rose-500' : 'bg-amber-400'}`} />

                                            <div className="flex items-center justify-between relative z-10">
                                                <div>
                                                    <h3 className="font-black text-gray-900 text-base leading-none mb-2">{item.nome}</h3>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${suggestion?.color === 'rose' ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
                                                            {suggestion?.zona}
                                                        </span>
                                                        {Number(suggestion?.deltaAplicado) !== 0 && (
                                                            <div className="flex flex-col gap-1.5">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex items-center gap-1 text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                                                                        Δ {suggestion?.deltaAplicado > 0 ? '+' : ''}{suggestion?.deltaAplicado} ajustado
                                                                    </div>
                                                                    <div className="flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                                                        + R$ {suggestion?.ganhoUnitario}/unid
                                                                    </div>
                                                                </div>
                                                                {suggestion?.ciclosTotais > 1 && (
                                                                    <div className="flex items-center gap-2 text-[9px] font-black text-gray-400 italic">
                                                                        <div className="flex items-center gap-0.5">
                                                                            {Array.from({ length: suggestion?.ciclosTotais }).map((_, idx) => (
                                                                                <div key={idx} className={`w-3 h-1 rounded-full ${idx < suggestion?.cicloAtual ? 'bg-indigo-500' : 'bg-gray-200'}`}></div>
                                                                            ))}
                                                                        </div>
                                                                        Ajuste {suggestion?.cicloAtual} de {suggestion?.ciclosTotais}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-gray-400 line-through tracking-tighter">R$ {item.precoAtual.toFixed(2)}</p>
                                                    <p className="text-2xl font-black text-emerald-600 tracking-tighter">R$ {suggestion?.precoSugerido}</p>
                                                </div>
                                            </div>

                                            <Button 
                                                size="sm"
                                                onClick={() => {
                                                    const prodParaUpdate = { ...item, precoSugerido: suggestion.precoSugerido, margemAlvo: suggestion.margemReal };
                                                    if (!isPartial) setSelectedProduct(prodParaUpdate);
                                                    else openUpgrade("Recupere sua margem agora.");
                                                }}
                                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 rounded-2xl group-hover:shadow-lg group-hover:shadow-indigo-600/20 transition-all"
                                            >
                                                Corrigir Agora
                                            </Button>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {selectedProduct && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl shadow-slate-900/40"
                    >
                        <div className="p-8 space-y-6">
                            <div className="flex justify-center">
                                <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center">
                                    <TrendingUp className="w-10 h-10 text-emerald-600" />
                                </div>
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-black text-gray-900 leading-tight">Confirmar Atualização</h3>
                                <p className="text-gray-500 font-medium">Veja o impacto real da sua decisão:</p>
                            </div>
                            <div className="bg-gray-50 rounded-3xl p-6 space-y-4 border border-gray-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-400">Preço Atual</span>
                                    <span className="text-lg font-black text-gray-400 line-through">R$ {selectedProduct.precoAtual.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-800">Novo Preço</span>
                                    <span className="text-2xl font-black text-emerald-600 tracking-tighter">R$ {selectedProduct.precoSugerido.toFixed(2)}</span>
                                </div>
                                <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-gray-400 uppercase">Impacto Mensal</span>
                                        <span className="text-xl font-black text-emerald-700">+ R$ {selectedProduct.ganhoPotencial.toFixed(2)}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-black text-gray-400 uppercase">Nova Margem</span>
                                        <p className="text-xl font-black text-emerald-700">{margemAlvo}%</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <Button 
                                    variant="outline" 
                                    onClick={() => setSelectedProduct(null)}
                                    className="flex-1 h-14 rounded-2xl font-bold border-gray-200"
                                >
                                    Cancelar
                                </Button>
                                <Button 
                                    onClick={handleApplySuggestion}
                                    disabled={isUpdating}
                                    className="flex-1 h-14 rounded-2xl font-bold bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
                                >
                                    {isUpdating ? 'Aplicando...' : 'Confirmar'}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}