import React from 'react';
import { calculatePriceSuggestion, analyzeCurrentPrice } from '@/utils/pricingAssistant';
import { Crown, AlertCircle, Check, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUpgrade } from '@/context/UpgradeContext';

export default function PricingAssistant({ cost, currentPrice, configs, isPro, onApply }) {
    const { openUpgrade } = useUpgrade();

    if (!isPro) {
        return (
            <div className="mt-4 p-5 border-2 border-dashed border-indigo-200 rounded-2xl bg-indigo-50/50 flex flex-col items-center text-center">
                <Crown className="w-8 h-8 text-indigo-600 mb-3" />
                <h4 className="text-sm font-bold text-indigo-900 uppercase tracking-tight mb-1">Análise de Lucro PRO</h4>
                <p className="text-xs text-indigo-700 leading-relaxed mb-4 max-w-[240px]">
                    Usuários PRO visualizam automaticamente o <span className="font-bold underline">lucro real</span> após impostos e taxas.
                </p>
                <Button 
                    type="button"
                    onClick={() => openUpgrade("Desbloqueie agora o cálculo automático de lucro real e evite prejuízos em cada venda.")}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-10 rounded-xl shadow-lg"
                >
                    Calcular preço ideal automaticamente (PRO)
                </Button>
            </div>
        );
    }

    const suggestion = calculatePriceSuggestion(cost, configs);
    const analysis = analyzeCurrentPrice(cost, currentPrice, configs);

    if (!suggestion) return null;

    if (suggestion.error) {
        return (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-xs text-red-700 font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {suggestion.message}
                </p>
            </div>
        );
    }

    return (
        <div className="mt-6 space-y-4">
            {/* Alerta de Saúde Financeira baseada no preço ATUAL */}
            {analysis && (
                <div className={`p-4 rounded-xl border-2 shadow-sm animate-in fade-in slide-in-from-top-2 duration-500 ${
                    analysis.status === 'DANGER' ? 'bg-red-50 border-red-200 text-red-900' :
                    analysis.status === 'WARNING' ? 'bg-amber-50 border-amber-200 text-amber-900' :
                    'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}>
                    <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                            analysis.status === 'DANGER' ? 'bg-red-100' :
                            analysis.status === 'WARNING' ? 'bg-amber-100' :
                            'bg-emerald-100'
                        }`}>
                            {analysis.status === 'DANGER' && <AlertCircle className="w-5 h-5 text-red-600" />}
                            {analysis.status === 'WARNING' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
                            {analysis.status === 'OK' && <ShieldCheck className="w-5 h-5 text-emerald-600" />}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold leading-tight">{analysis.message}</p>
                            <div className="mt-2 flex gap-4 text-[11px] font-medium opacity-80 uppercase tracking-tight">
                                <span>Lucro Unitário: <span className="font-bold">R$ {analysis.lucroUnitario}</span></span>
                                <span>Margem Líquida: <span className="font-bold">{analysis.margemLiquida}%</span></span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Sugestão de Preço Ideal */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl ring-1 ring-white/10">
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 flex items-center justify-between text-white">
                    <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5 fill-white" /> Preço Recomendado (Atacado/Varejo)
                    </span>
                    <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">Markup: {suggestion.detalhes.markupEquivalente}</span>
                </div>
                
                <div className="p-5 space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight mb-1">Preço Sugerido</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-sm font-medium text-slate-500">R$</span>
                                <span className="text-3xl font-black text-white">{suggestion.precoSugerido}</span>
                            </div>
                        </div>
                        <Button 
                            type="button"
                            onClick={() => onApply(suggestion.precoSugerido)}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs h-10 px-6 rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                        >
                            <Check className="w-4 h-4 mr-2 stroke-[3]" /> Aplicar Agora
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
                        <div className="bg-white/5 rounded-xl p-3">
                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Lucro Estimado</p>
                            <p className="text-sm font-bold text-emerald-400">R$ {suggestion.lucroUnitario}</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3">
                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Margem Líquida</p>
                            <p className="text-sm font-bold text-emerald-400">{suggestion.margemLiquida}%</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
