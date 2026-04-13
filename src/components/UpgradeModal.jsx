import React, { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Rocket, Zap, Loader2, ShieldCheck, CheckCircle2, Clock } from "lucide-react";
import { httpClient } from '@/api/httpClient';
import { useToast } from "@/components/ui/use-toast";

// Estados possíveis do modal
// 'idle'       → modal de upgrade normal
// 'pending'    → usuário voltou do checkout, aguardando confirmação
// 'confirmed'  → plano confirmado como PRO

export function UpgradeModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [paymentState, setPaymentState] = useState('idle'); // 'idle' | 'pending' | 'confirmed'
    const [pollCount, setPollCount] = useState(0);
    const { toast } = useToast();

    const POLL_INTERVAL_MS = 5000;
    const MAX_POLLS = 12; // 12 × 5s = 60s máximo de espera

    // Verificar status do plano no backend
    const checkPlanStatus = useCallback(async () => {
        try {
            const data = await httpClient('/payments/plan-status');
            if (data?.plan === 'pro') {
                setPaymentState('confirmed');
                return true;
            }
            return false;
        } catch {
            return false;
        }
    }, []);

    // Polling após retorno do checkout
    useEffect(() => {
        if (paymentState !== 'pending') return;
        if (pollCount >= MAX_POLLS) {
            // Tempo esgotado — informar usuário mas não travar
            toast({
                title: "Confirmação ainda pendente",
                description: "O pagamento pode demorar alguns minutos para ser processado. Recarregue a página em instantes.",
            });
            setPaymentState('idle');
            setIsOpen(false);
            return;
        }

        const timer = setTimeout(async () => {
            const isPro = await checkPlanStatus();
            if (!isPro) {
                setPollCount(c => c + 1);
            }
        }, POLL_INTERVAL_MS);

        return () => clearTimeout(timer);
    }, [paymentState, pollCount, checkPlanStatus, toast]);

    // Detectar retorno do PagSeguro via query string ?payment=success
    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener('open-upgrade-modal', handleOpen);

        // Se o usuário voltou do checkout externo
        const params = new URLSearchParams(window.location.search);
        if (params.get('payment') === 'success') {
            setPaymentState('pending');
            setPollCount(0);
            setIsOpen(true);
            // Limpar query string sem recarregar a página
            window.history.replaceState({}, '', window.location.pathname);
        }

        return () => window.removeEventListener('open-upgrade-modal', handleOpen);
    }, []);

    // Quando confirmado: notificar e fechar
    useEffect(() => {
        if (paymentState === 'confirmed') {
            toast({
                title: "🎉 Plano Pro ativado com sucesso!",
                description: "Suas vendas agora são ilimitadas. Bem-vindo ao Pro!",
            });
            // Aguardar 3s para o usuário ver a mensagem de sucesso antes de fechar
            const t = setTimeout(() => {
                setIsOpen(false);
                // Recarregar a página para sincronizar o contexto do usuário
                window.location.reload();
            }, 3000);
            return () => clearTimeout(t);
        }
    }, [paymentState, toast]);

    const handleUpgrade = async () => {
        setLoading(true);
        try {
            const data = await httpClient('/payments/upgrade', { method: 'POST' });
            if (data.checkoutUrl) {
                // Redirecionar para o Checkout do PagSeguro (Cartão, PIX, Boleto)
                window.location.href = data.checkoutUrl;
            } else {
                throw new Error('Link de pagamento não recebido');
            }
        } catch (error) {
            console.error('[UPGRADE ERROR]', error);
            toast({
                title: "Erro ao iniciar pagamento",
                description: "Não foi possível conectar com o PagSeguro. Tente novamente.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleManualCheck = async () => {
        const isPro = await checkPlanStatus();
        if (!isPro) {
            toast({
                title: "Pagamento ainda não confirmado",
                description: "Aguarde alguns instantes e tente novamente.",
            });
        }
    };

    // ----- TELA: Aguardando confirmação -----
    if (paymentState === 'pending' || paymentState === 'confirmed') {
        return (
            <Dialog open={isOpen} onOpenChange={() => {}}>
                <DialogContent className="sm:max-w-[420px] border-none bg-slate-900 text-white p-0 shadow-2xl">
                    <div className="h-28 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-500 flex items-center justify-center">
                        {paymentState === 'confirmed'
                            ? <CheckCircle2 className="w-14 h-14 text-white animate-bounce" />
                            : <Clock className="w-14 h-14 text-white animate-pulse" />
                        }
                    </div>

                    <div className="p-6 text-center space-y-4">
                        {paymentState === 'confirmed' ? (
                            <>
                                <h2 className="text-2xl font-bold text-white">Plano Pro ativado! 🎉</h2>
                                <p className="text-slate-300">Suas vendas agora são ilimitadas.</p>
                            </>
                        ) : (
                            <>
                                <h2 className="text-xl font-bold text-white">Aguardando confirmação do pagamento</h2>
                                <p className="text-slate-400 text-sm">
                                    Estamos verificando o status do seu pagamento no PagSeguro.
                                    Isso pode levar até 1 minuto.
                                </p>

                                <div className="flex items-center justify-center gap-2 text-slate-400 text-xs">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Verificando... ({pollCount}/{MAX_POLLS})
                                </div>

                                <Button
                                    variant="ghost"
                                    onClick={handleManualCheck}
                                    className="w-full text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl mt-2"
                                >
                                    Verificar agora
                                </Button>

                                <p className="text-xs text-slate-500">
                                    Seu pagamento foi registrado. O sistema será atualizado automaticamente.
                                </p>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    // ----- TELA: Modal de upgrade normal -----
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[450px] overflow-hidden border-none bg-slate-900 text-white p-0 shadow-2xl">
                <div className="h-32 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-500 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-[-10%] left-[-10%] w-40 h-40 bg-white rounded-full blur-3xl animate-pulse"></div>
                    </div>
                    <Rocket className="w-16 h-16 text-white animate-bounce" />
                </div>

                <div className="p-6 pt-8">
                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-2xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            🚀 Seu negócio está crescendo — você atingiu o limite do plano gratuito.
                        </DialogTitle>
                        <DialogDescription className="text-slate-300 text-base mt-4">
                            Você já registrou <span className="font-bold text-white">150 vendas</span> este mês.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mb-8">
                        <div className="flex items-start gap-3 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 group hover:border-blue-500 transition-colors">
                            <Zap className="w-6 h-6 text-yellow-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-white">Vendas sem limites</p>
                                <p className="text-sm text-slate-400">Libere o acesso ilimitado e continue registrando seu lucro em tempo real.</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-center p-3 gap-2">
                            <span className="text-3xl font-extrabold text-white">R$ 29,99</span>
                            <span className="text-slate-400">/mês</span>
                        </div>

                        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                            <ShieldCheck className="w-4 h-4 text-green-500" />
                            Pagamento seguro via PagSeguro/PagBank
                        </div>
                    </div>

                    <DialogFooter className="flex flex-col sm:flex-col gap-3">
                        <Button
                            onClick={handleUpgrade}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold h-12 rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-blue-500/20"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                "Liberar acesso ilimitado"
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => setIsOpen(false)}
                            className="w-full text-slate-400 hover:text-white hover:bg-slate-800 h-10 rounded-xl"
                        >
                            Continuar no plano gratuito
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
