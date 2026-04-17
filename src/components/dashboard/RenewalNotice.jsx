import React from 'react';
import { useUpgrade } from '@/context/UpgradeContext';
import { Clock, AlertTriangle, Crown, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { differenceInDays, isAfter } from 'date-fns';

export default function RenewalNotice({ user, stats }) {
    const { openUpgrade } = useUpgrade();
    
    if (!user || !user.planExpiresAt) return null;

    const expiresAt = new Date(user.planExpiresAt);
    const now = new Date();
    const daysLeft = differenceInDays(expiresAt, now);
    const hasExpired = isAfter(now, expiresAt);

    // 1. Reativação (Já foi PRO e expirou)
    if (hasExpired && user.plan === 'free') {
        const lucroPotencial = stats?.insights?.lucroPotencial || 0;
        return (
            <div className="mb-6 p-6 rounded-[2rem] bg-slate-900 border border-white/10 shadow-2xl relative overflow-hidden text-white">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 blur-[60px] rounded-full -mr-16 -mt-16" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-8 h-8 text-amber-500" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-xl font-black mb-1">Seu plano PRO expirou! ⚡️</h2>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            No último mês, você deixou de lucrar <span className="text-amber-500 font-bold">R$ {lucroPotencial.toLocaleString('pt-BR')}</span> por estar sem o assistente de preço.
                        </p>
                    </div>
                    <Button 
                        onClick={() => openUpgrade("Reative seu plano PRO agora para recuperar suas margens e parar de perder dinheiro.")}
                        className="h-12 px-8 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-xl shadow-amber-500/20 active:scale-95 transition-all whitespace-nowrap gap-2"
                    >
                        Reativar PRO Agora <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        );
    }

    // 2. Renovação (Está PRO mas vence em breve <= 3 dias)
    if (user.plan === 'pro' && daysLeft <= 3 && daysLeft >= 0) {
        return (
            <div className="mb-6 p-4 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/20 text-white flex items-center justify-between gap-4 animate-pulse">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-bold">Atenção: Renovação do Plano</p>
                        <p className="text-[10px] text-indigo-100 uppercase font-black tracking-widest">
                            Seu acesso PRO vence {daysLeft === 0 ? 'HOJE' : `em ${daysLeft} ${daysLeft === 1 ? 'dia' : 'dias'}`}
                        </p>
                    </div>
                </div>
                <Button 
                    onClick={() => openUpgrade("Garanta a continuidade de suas ferramentas e não perca o monitoramento de lucro.")}
                    variant="secondary"
                    className="h-9 px-4 bg-white text-indigo-600 font-bold text-xs rounded-lg hover:bg-indigo-50 shadow-md"
                >
                    Renovar Agora
                </Button>
            </div>
        );
    }

    return null;
}
