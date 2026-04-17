import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, ArrowUpRight, Crown, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUpgrade } from '@/context/UpgradeContext';

export default function LucratividadeBanner({ stats }) {
    const { openUpgrade } = useUpgrade();

    if (!stats?.insights) return null;

    const { lucroMes, margemMedia, lucroPotencial } = stats.insights;
    const isPro = stats.usage?.plan === 'pro';

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-white border-none shadow-sm overflow-hidden group">
                <CardContent className="p-5 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Lucro Limpo Real</p>
                        <h3 className="text-2xl font-black text-slate-900 leading-none">R$ {lucroMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                        <p className="text-[10px] text-emerald-600 font-bold mt-2 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> MARGEM MÉDIA: {margemMedia}%
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ArrowUpRight className="w-6 h-6 text-emerald-600" />
                    </div>
                </CardContent>
            </Card>

            <Card className={`relative overflow-hidden md:col-span-2 ${isPro ? 'bg-white border-none shadow-sm' : 'bg-slate-900 text-white shadow-xl ring-1 ring-white/10'}`}>
                <CardContent className="p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex-1">
                        {!isPro && (
                            <div className="flex items-center gap-1.5 text-amber-500 mb-1">
                                <Crown className="w-3.5 h-3.5 fill-amber-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Potencial de Ganho Pro</span>
                            </div>
                        )}
                        <h4 className={`text-sm font-bold ${isPro ? 'text-slate-900' : 'text-white'}`}>
                            {lucroPotencial > 0 
                                ? `Você poderia ter lucrado +R$ ${lucroPotencial.toLocaleString('pt-BR')} com preços ideais.`
                                : `Parabéns! Seus preços estão otimizados para lucro máximo.`}
                        </h4>
                        <p className={`text-[11px] mt-1 ${isPro ? 'text-slate-500' : 'text-slate-400'}`}>
                            {isPro 
                                ? "O assistente está monitorando suas margens em tempo real." 
                                : "Ative o assistente de preço para ajustar seus valores automaticamente."}
                        </p>
                    </div>
                    
                    {!isPro && (
                        <Button 
                            onClick={() => openUpgrade("Aumente seu lucro mensal ajustando seus preços com o Assistente PRO.")}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-6 h-10 rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all whitespace-nowrap"
                        >
                            Ativar cálculo automático (PRO)
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
