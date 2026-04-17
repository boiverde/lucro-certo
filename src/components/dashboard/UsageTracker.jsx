import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Crown, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function UsageTracker({ usage }) {
    if (!usage || usage.plan === 'pro') return null;

    const { count, limit, percentage } = usage;

    // Definição de cores baseada na porcentagem
    let barColor = 'bg-emerald-500';
    let textColor = 'text-emerald-600';
    let bgColor = 'bg-emerald-50';

    if (percentage >= 85) {
        barColor = 'bg-red-500';
        textColor = 'text-red-600';
        bgColor = 'bg-red-50';
    } else if (percentage >= 70) {
        barColor = 'bg-amber-500';
        textColor = 'text-amber-600';
        bgColor = 'bg-amber-50';
    }

    return (
        <Card className="mb-6 border-none shadow-md overflow-hidden bg-white">
            <CardContent className="p-0">
                <div className="flex flex-col md:flex-row items-center">
                    {/* Info Section */}
                    <div className="flex-1 p-5 flex flex-col sm:flex-row items-center gap-4">
                        <div className={`p-3 rounded-2xl ${bgColor} shrink-0`}>
                            <Zap className={`w-6 h-6 ${textColor}`} />
                        </div>
                        
                        <div className="flex-1 text-center sm:text-left">
                            <h3 className="text-sm font-bold text-gray-900 group">
                                Uso do Plano Gratuito
                                {percentage >= 85 && <span className="ml-2 text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full uppercase tracking-tighter">Limite Próximo!</span>}
                            </h3>
                            <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                                <p className="text-xs text-gray-500">
                                    <span className={`font-bold ${textColor}`}>{count}</span> / {limit} vendas este mês
                                </p>
                                <span className="text-[10px] text-gray-400 font-medium font-mono">({percentage}%)</span>
                            </div>
                            
                            {/* Barra de Progresso */}
                            <div className="mt-3 w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-1000 ease-out ${barColor}`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <Link 
                        to="/plano" 
                        className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 text-white p-5 flex items-center justify-center gap-2 transition-colors group"
                    >
                        <div className="text-center md:text-left">
                            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Upgrade</p>
                            <p className="text-sm font-bold flex items-center gap-1">
                                Ser ILIMITADO <Crown className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                            </p>
                        </div>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
