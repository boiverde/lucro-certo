import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Rocket, Zap, Loader2, ShieldCheck, CheckCircle2, Clock, Copy, Check, QrCode } from "lucide-react";
import { httpClient } from '@/api/httpClient';
import { toast } from 'sonner';

// Estados do modal
// 'idle'     → tela de upgrade (call to action)
// 'cpf'      → tela de coleta de CPF
// 'loading'  → gerando cobrança Pix
// 'qrcode'   → exibindo QR Code + copia-e-cola
// 'polling'  → aguardando pagamento
// 'confirmed'→ pagamento confirmado

const POLL_INTERVAL_MS = 5000;
const MAX_POLLS = 36; // 36 × 5s = 3 minutos

export function UpgradeModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState('idle');
    const [cpf, setCpf] = useState('');
    const [pix, setPix] = useState(null); // { orderId, qrCodeBase64, qrCodeText, expiresAt }
    const [pollCount, setPollCount] = useState(0);
    const [copied, setCopied] = useState(false);
    const pollRef = useRef(null);

    // ── Abrir modal via evento global ──────────────────────────────
    useEffect(() => {
        const handleOpen = () => { setIsOpen(true); setStep('idle'); };
        window.addEventListener('open-upgrade-modal', handleOpen);
        return () => window.removeEventListener('open-upgrade-modal', handleOpen);
    }, []);

    // ── Polling de status ──────────────────────────────────────────
    const stopPolling = useCallback(() => {
        if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
        }
    }, []);

    const checkPixStatus = useCallback(async (orderId, count) => {
        if (count >= MAX_POLLS) {
            stopPolling();
            toast.warning('Tempo expirado', {
                description: 'O PIX expirou. Gere um novo código para tentar novamente.'
            });
            setStep('idle');
            return;
        }
        try {
            const data = await httpClient(`/payments/pix/status/${orderId}`);
            if (data?.status === 'PAID') {
                stopPolling();
                setStep('confirmed');
            }
        } catch {
            // Silencia erros de polling; tenta de novo no próximo ciclo
        }
    }, [stopPolling]);

    useEffect(() => {
        if (step === 'polling' && pix?.orderId) {
            let count = pollCount;
            pollRef.current = setInterval(() => {
                count++;
                setPollCount(count);
                checkPixStatus(pix.orderId, count);
            }, POLL_INTERVAL_MS);
        }
        return stopPolling;
    }, [step, pix]);

    // ── Quando confirmado ──────────────────────────────────────────
    useEffect(() => {
        if (step === 'confirmed') {
            toast.success('🎉 Plano Pro ativado!', {
                description: 'Suas vendas agora são ilimitadas. Seja bem-vindo ao Pro!'
            });
            const t = setTimeout(() => {
                setIsOpen(false);
                window.location.reload();
            }, 3000);
            return () => clearTimeout(t);
        }
    }, [step]);

    // ── Gerar cobrança Pix ─────────────────────────────────────────
    const handleCreatePix = async () => {
        const cleanCpf = cpf.replace(/\D/g, '');
        if (cleanCpf.length < 11) {
            toast.error('CPF inválido', { description: 'Digite um CPF válido com 11 dígitos.' });
            return;
        }
        setStep('loading');
        try {
            const data = await httpClient('/payments/pix', {
                method: 'POST',
                body: JSON.stringify({ cpf: cleanCpf })
            });
            setPix(data);
            setPollCount(0);
            setStep('polling');
        } catch (err) {
            console.error('[PIX ERROR]', err);
            toast.error('Erro ao gerar PIX', {
                description: err?.data?.detail || 'Não foi possível criar a cobrança. Tente novamente.'
            });
            setStep('cpf');
        }
    };

    // ── Copiar copia-e-cola ─────────────────────────────────────────
    const handleCopy = () => {
        if (!pix?.qrCodeText) return;
        navigator.clipboard.writeText(pix.qrCodeText).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        });
    };

    const handleClose = () => {
        if (step === 'confirmed') return;
        stopPolling();
        setIsOpen(false);
        setTimeout(() => { setStep('idle'); setPix(null); setCpf(''); setPollCount(0); }, 300);
    };

    // ── Tela: Confirmado ───────────────────────────────────────────
    if (step === 'confirmed') {
        return (
            <Dialog open={isOpen} onOpenChange={() => {}}>
                <DialogContent className="sm:max-w-[400px] border-none bg-slate-900 text-white p-0 shadow-2xl overflow-hidden">
                    <div className="h-28 bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                        <CheckCircle2 className="w-14 h-14 text-white animate-bounce" />
                    </div>
                    <div className="p-6 text-center space-y-3">
                        <h2 className="text-2xl font-bold text-white">Plano Pro ativado! 🎉</h2>
                        <p className="text-slate-300">Suas vendas agora são ilimitadas. Redirecionando...</p>
                        <Loader2 className="w-5 h-5 animate-spin text-slate-400 mx-auto" />
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    // ── Tela: QR Code / Aguardando pagamento ──────────────────────
    if (step === 'polling' && pix) {
        const expiresDate = pix.expiresAt ? new Date(pix.expiresAt) : null;
        return (
            <Dialog open={isOpen} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-[420px] border-none bg-slate-900 text-white p-0 shadow-2xl overflow-hidden">
                    <div className="h-20 bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center gap-3">
                        <QrCode className="w-8 h-8 text-white" />
                        <span className="font-bold text-lg text-white">Pague via PIX</span>
                    </div>

                    <div className="p-5 space-y-4">
                        {/* QR Code Image */}
                        <div className="flex justify-center">
                            <div className="bg-white p-3 rounded-xl">
                                <img
                                    src={pix.qrCodeBase64}
                                    alt="QR Code PIX"
                                    className="w-48 h-48 object-contain"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            </div>
                        </div>

                        {/* Valor */}
                        <div className="text-center">
                            <p className="text-slate-400 text-xs">Valor</p>
                            <p className="text-white font-bold text-2xl">R$ 29,99</p>
                            {expiresDate && (
                                <p className="text-slate-500 text-xs mt-1">
                                    Expira às {expiresDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            )}
                        </div>

                        {/* Copia e Cola */}
                        <div className="space-y-1">
                            <p className="text-slate-400 text-xs">Código PIX Copia e Cola</p>
                            <div className="flex gap-2">
                                <input
                                    readOnly
                                    value={pix.qrCodeText}
                                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 truncate"
                                />
                                <Button
                                    size="sm"
                                    onClick={handleCopy}
                                    className={`shrink-0 rounded-lg transition-all ${copied ? 'bg-green-600 hover:bg-green-600' : 'bg-slate-700 hover:bg-slate-600'}`}
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>
                            {copied && <p className="text-green-400 text-xs">✓ Copiado!</p>}
                        </div>

                        {/* Status polling */}
                        <div className="flex items-center justify-center gap-2 text-slate-400 text-sm pt-1">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Aguardando pagamento...</span>
                        </div>

                        <p className="text-center text-slate-500 text-xs">
                            Após efetuar o pagamento, o plano Pro será ativado automaticamente.
                        </p>

                        <Button
                            variant="ghost"
                            onClick={handleClose}
                            className="w-full text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg text-xs"
                        >
                            Cancelar
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    // ── Tela: Coleta de CPF ─────────────────────────────────────────
    if (step === 'cpf' || step === 'loading') {
        return (
            <Dialog open={isOpen} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-[400px] border-none bg-slate-900 text-white p-0 shadow-2xl overflow-hidden">
                    <div className="h-20 bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                        <QrCode className="w-8 h-8 text-white" />
                        <span className="font-bold text-lg text-white ml-3">Gerar PIX</span>
                    </div>
                    <div className="p-6 space-y-4">
                        <p className="text-slate-300 text-sm">
                            Para gerar o QR Code PIX informe seu CPF. Exigido pelo PagBank para emissão da cobrança.
                        </p>
                        <div className="space-y-2">
                            <Label htmlFor="cpf" className="text-slate-400 text-xs">CPF do pagador</Label>
                            <Input
                                id="cpf"
                                placeholder="000.000.000-00"
                                value={cpf}
                                onChange={(e) => setCpf(e.target.value)}
                                maxLength={14}
                                className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                                disabled={step === 'loading'}
                            />
                        </div>
                        <Button
                            onClick={handleCreatePix}
                            disabled={step === 'loading'}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold h-12 rounded-xl"
                        >
                            {step === 'loading'
                                ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Gerando PIX...</>
                                : 'Gerar QR Code PIX'
                            }
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={handleClose}
                            className="w-full text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-xl text-sm"
                        >
                            Cancelar
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    // ── Tela: Modal Idle (call to action) ─────────────────────────
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
                    <h2 className="text-2xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">
                        🚀 Seu negócio está crescendo rápido
                    </h2>
                    <p className="text-slate-300 text-base mb-6">
                        Você atingiu o limite do plano gratuito de <span className="font-bold text-white">150 vendas</span> no mês.
                    </p>

                    <div className="space-y-3 mb-6">
                        {['Vendas ilimitadas', 'Sem bloqueio ao crescer', 'Controle completo do negócio', 'Ativação automática após pagamento'].map(b => (
                            <div key={b} className="flex items-center gap-3 bg-slate-800/50 px-4 py-3 rounded-xl border border-slate-700/50">
                                <Zap className="w-5 h-5 text-yellow-400 shrink-0" />
                                <span className="text-slate-200 text-sm">{b}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-baseline justify-center gap-1 mb-2">
                        <span className="text-3xl font-extrabold text-white">R$ 29,99</span>
                        <span className="text-slate-400">/mês</span>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-6">
                        <ShieldCheck className="w-4 h-4 text-green-500" />
                        Pagamento seguro via PagSeguro/PagBank — PIX
                    </div>

                    <div className="space-y-3">
                        <Button
                            onClick={() => setStep('cpf')}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold h-12 rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-blue-500/20"
                        >
                            <QrCode className="w-4 h-4 mr-2" />
                            Liberar acesso ilimitado via PIX
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => setIsOpen(false)}
                            className="w-full text-slate-400 hover:text-white hover:bg-slate-800 h-10 rounded-xl"
                        >
                            Continuar no plano gratuito
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
