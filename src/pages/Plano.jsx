import React from 'react';
import { Zap, CheckCircle2, Crown, Rocket, ShieldCheck, ArrowRight } from 'lucide-react';
import { usePlan } from '@/api/usePlan';
import { Button } from '@/components/ui/button';
import { httpClient } from '@/api/httpClient';
import { useToast } from '@/components/ui/use-toast';

const BENEFITS_FREE = [
    'Vendas ilimitadas',
    'Sem bloqueio ao crescer',
    'Controle completo do negócio',
    'Ativação automática após pagamento',
];

const BENEFITS_PRO = [
    'Vendas ilimitadas',
    'Sem bloqueio mensal',
    'Plano premium ativo',
];

export default function Plano() {
    const { plan, loading } = usePlan();
    const { toast } = useToast();
    const [upgrading, setUpgrading] = React.useState(false);

    const handleUpgrade = async () => {
        setUpgrading(true);
        try {
            const data = await httpClient('/payments/upgrade', { method: 'POST' });
            if (data?.checkoutUrl) {
                window.location.href = data.checkoutUrl;
            } else {
                throw new Error('sem link');
            }
        } catch (err) {
            toast({
                title: 'Erro ao iniciar pagamento',
                description: 'Não foi possível conectar com o PagSeguro. Tente novamente.',
                variant: 'destructive',
            });
        } finally {
            setUpgrading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
            </div>
        );
    }

    // ── PLANO PRO ──────────────────────────────────────────────────
    if (plan === 'pro') {
        return (
            <div className="max-w-xl mx-auto px-4 py-10">
                <div className="rounded-2xl overflow-hidden shadow-xl border border-green-100">
                    {/* Header */}
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-8 flex flex-col items-center text-white text-center">
                        <Crown className="w-16 h-16 mb-4 drop-shadow-lg" />
                        <h1 className="text-3xl font-extrabold mb-1">Plano PRO</h1>
                        <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-sm font-semibold px-4 py-1 rounded-full mt-2">
                            <CheckCircle2 className="w-4 h-4" /> Ativo
                        </span>
                    </div>

                    {/* Body */}
                    <div className="bg-white p-8">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Benefícios liberados</h2>
                        <ul className="space-y-3 mb-8">
                            {BENEFITS_PRO.map((b) => (
                                <li key={b} className="flex items-center gap-3 text-gray-700">
                                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                    <span>{b}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="rounded-xl bg-green-50 border border-green-100 p-4 text-sm text-green-800 text-center">
                            Seu negócio está totalmente desbloqueado. Continue crescendo! 🚀
                        </div>

                        <p className="text-xs text-gray-400 text-center mt-6">
                            Para gerenciar cobranças acesse diretamente o PagSeguro/PagBank.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // ── PLANO FREE ─────────────────────────────────────────────────
    return (
        <div className="max-w-xl mx-auto px-4 py-10">
            <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200">
                {/* Header */}
                <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 flex flex-col items-center text-white text-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-[-20%] left-[-10%] w-60 h-60 bg-white rounded-full blur-3xl" />
                    </div>
                    <Rocket className="w-16 h-16 mb-4 animate-bounce drop-shadow-lg" />
                    <h1 className="text-2xl font-extrabold leading-tight mb-2">
                        Seu negócio está crescendo rápido
                    </h1>
                    <p className="text-blue-100 text-sm max-w-xs">
                        Você está no plano gratuito e pode registrar até{' '}
                        <span className="font-bold text-white">150 vendas</span> por mês.
                    </p>
                </div>

                {/* Body */}
                <div className="bg-white p-8">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">
                        O que você libera com o PRO
                    </h2>
                    <ul className="space-y-3 mb-6">
                        {BENEFITS_FREE.map((b) => (
                            <li key={b} className="flex items-center gap-3 text-gray-700">
                                <Zap className="w-5 h-5 text-indigo-500 shrink-0" />
                                <span>{b}</span>
                            </li>
                        ))}
                    </ul>

                    {/* Preço */}
                    <div className="flex items-baseline justify-center gap-1 my-6">
                        <span className="text-4xl font-extrabold text-gray-900">R$ 29,99</span>
                        <span className="text-gray-400 text-sm">/mês</span>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mb-6">
                        <ShieldCheck className="w-4 h-4 text-green-500" />
                        Pagamento seguro via PagSeguro/PagBank
                    </div>

                    {/* CTAs */}
                    <div className="space-y-3">
                        <Button
                            onClick={handleUpgrade}
                            disabled={upgrading}
                            className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all hover:scale-[1.02]"
                        >
                            {upgrading ? (
                                <span className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                    Aguarde...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <ArrowRight className="w-4 h-4" />
                                    Liberar acesso ilimitado
                                </span>
                            )}
                        </Button>

                        <Button
                            variant="ghost"
                            onClick={() => window.history.back()}
                            className="w-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl"
                        >
                            Continuar no plano gratuito
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
