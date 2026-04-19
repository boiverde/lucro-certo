import React from 'react';
import { calculatePriceSuggestion, analyzeCurrentPrice } from '@/utils/pricingAssistant';
import { Crown, AlertCircle, Check, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUpgrade } from '@/context/UpgradeContext';

export default function PricingAssistant({ cost, currentPrice, configs, isPro, onApply }) {
    const { openUpgrade } = useUpgrade();

    const suggestion = calculatePriceSuggestion(cost, configs);
    const analysis = analyzeCurrentPrice(cost, currentPrice, configs);

    return (
        <div className="mt-6 space-y-4">
            {/* Alerta de Saúde Financeira - VISÍVEL PARA TODOS (Gatilho de Conversão) */}
            {analysis && (
                <div className={`p-4 rounded-xl border-2 shadow-sm animate-in fade-in slide-in-from-top-2 duration-500 ${
                    analysis.status === 'DANGER' ? 'bg-red-50 border-red-200 text-red-900' :
                    analysis.status === 'WARNING' ? 'bg-amber-50 border-amber-200 text-amber-900' :
                    'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}>
                    <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg shrink-0 ${
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
                                <span>Lucro: <span className="font-bold">R$ {analysis.lucroUnitario}</span></span>
                                <span>Margem: <span className="font-bold">{analysis.margemLiquida}%</span></span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Sugestão de Preço Ideal - EXCLUSIVO PRO */}
            {!isPro ? (
                 <div className="p-5 border-2 border-dashed border-indigo-200 rounded-3xl bg-indigo-50/30 flex flex-col items-center text-center">
                    <Crown className="w-10 h-10 text-indigo-600 mb-4 opacity-40" />
                    <h4 className="text-base font-black text-indigo-950 leading-tight mb-1">Como resolver este prejuízo?</h4>
                    <p className="text-xs text-indigo-700/80 mb-5 max-w-[280px]">
                        Usuários <span className="font-bold text-indigo-900">PRO</span> recebem o cálculo automático do preço ideal para garantir lucro real em cada venda.
                    </p>
                    <Button 
                        type="button"
                        onClick={() => openUpgrade("Elimine o prejuízo agora com a precificação automática e inteligente.")}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 rounded-2xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                    >
                        Ver Preço Sugerido (PRO)
                    </Button>
                </div>
            ) : (
                suggestion && !suggestion.error && (
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                        <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 flex items-center justify-between text-white">
                            <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                <Crown className="w-3.5 h-3.5 fill-white" /> Preço Sugerido pelo sistema
                            </span>
                            <span className="text-[10px] font-bold bg-white/20 px-2.5 py-1 rounded-full border border-white/10">Markup: {suggestion.detalhes.markupEquivalente}</span>
                        </div>
                        
                        <div className="p-6 space-y-5">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">Sugestão de Venda</p>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-base font-medium text-slate-500">R$</span>
                                        <span className="text-4xl font-black text-white tracking-tighter">{suggestion.precoSugerido}</span>
                                    </div>
                                </div>
                                <Button 
                                    type="button"
                                    onClick={() => onApply(suggestion.precoSugerido)}
                                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm h-12 px-8 rounded-2xl shadow-xl shadow-amber-500/20 active:scale-95 transition-all"
                                >
                                    <Check className="w-4 h-4 mr-2 stroke-[4]" /> Aplicar
                                </Button>
                            </div>
        
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                                <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5">
                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1.5">Lucro Alvo</p>
                                    <p className="text-lg font-black text-emerald-400">R$ {suggestion.lucroUnitario}</p>
                                </div>
                                <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5">
                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1.5">Margem Alvo</p>
                                    <p className="text-lg font-black text-emerald-400">{suggestion.margemLiquida}%</p>
                                </div>
                            </div>
                            
                            {suggestion.warning && (
                                <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex gap-3 text-amber-200">
                                    <AlertTriangle className="w-5 h-5 shrink-0" />
                                    <p className="text-[11px] font-bold leading-tight">{suggestion.warning}</p>
                                </div>
                            )}

                            <div className="pt-2 text-center">
                                <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Engine Algorithm {suggestion.versao}</span>
                            </div>
                        </div>
                    </div>
                )
            )}
        </div>
    );
}
