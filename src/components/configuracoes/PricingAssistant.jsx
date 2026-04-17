import React from 'react';
import { calculatePriceSuggestion } from '@/utils/pricingAssistant';
import { Crown, AlertCircle, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PricingAssistant({ cost, configs, isPro, onApply }) {
    if (!isPro) {
        return (
            <div className="mt-2 p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
                <p className="text-xs text-indigo-700 flex items-center gap-2">
                    <Crown className="w-3 h-3" />
                    <strong>Dica PRO:</strong> Desbloqueie o assistente de preço inteligente e veja seu lucro real.
                </p>
            </div>
        );
    }

    const suggestion = calculatePriceSuggestion(cost, configs);

    if (!suggestion) return null;

    if (suggestion.error) {
        return (
            <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-3 h-3" />
                    {suggestion.message}
                </p>
            </div>
        );
    }

    return (
        <div className="mt-3 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-emerald-600 px-3 py-1.5 flex items-center justify-between text-white">
                <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Crown className="w-3 h-3 fill-white" /> Assistente de Preço
                </span>
                <span className="text-[10px] font-medium opacity-80">Markup: {suggestion.detalhes.markupEquivalente}</span>
            </div>
            
            <div className="p-4 space-y-3">
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-[10px] text-emerald-600 font-bold uppercase">Preço Ideal</p>
                        <p className="text-2xl font-black text-emerald-950">R$ {suggestion.precoSugerido}</p>
                    </div>
                    <Button 
                        type="button"
                        onClick={() => onApply(suggestion.precoSugerido)}
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 rounded-lg shadow-md"
                    >
                        <Check className="w-3 h-3 mr-1" /> Aplicar
                    </Button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-100">
                    <div>
                        <p className="text-[9px] text-gray-500 uppercase">Lucro Limpo</p>
                        <p className="text-sm font-bold text-emerald-800">R$ {suggestion.lucroUnitario}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] text-gray-500 uppercase">Margem Líquida</p>
                        <p className="text-sm font-bold text-emerald-800">{suggestion.margemLiquida}%</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
