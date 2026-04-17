import React, { useState, useEffect } from 'react';
import { useUpgrade } from '@/context/UpgradeContext';
import { 
    X, QrCode, Loader2, Check, Copy, Clock, 
    Crown, Rocket, ShieldCheck, TrendingUp, AlertCircle, Calendar,
    ArrowRight, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { httpClient } from '@/api/httpClient';
import { useQuery } from "@tanstack/react-query";

export default function UpgradeModal() {
    const { isOpen, closeUpgrade, reason, pendingPix, savePendingPix } = useUpgrade();
    const [step, setStep] = useState('plan'); // plan, cpf, loading, qrcode, confirmed
    const [selectedPlan, setSelectedPlan] = useState('pro_yearly'); // Pré-selecionar Anual
    const [cpf, setCpf] = useState('');
    const [pix, setPix] = useState(null);
    const [copied, setCopied] = useState(false);
    const [pollingActive, setPollingActive] = useState(false);
    const [countdown, setCountdown] = useState("");

    const { data: dashboardStats } = useQuery({
        queryKey: ['dashboard-stats-mini'],
        queryFn: async () => await httpClient('/dashboard/stats'),
        enabled: isOpen,
    });

    const lucroPotencial = dashboardStats?.insights?.lucroPotencial || 0;

    useEffect(() => {
        if (isOpen) {
            if (pendingPix && new Date(pendingPix.expiresAt) > new Date()) {
                setPix(pendingPix);
                setStep('qrcode');
                setPollingActive(true);
            } else {
                setStep('plan');
                setSelectedPlan('pro_yearly'); // Reset para Anual ao abrir
                setPix(null);
                setPollingActive(false);
            }
            
            // Analytics: Visualização do Modal
            fetch(`${import.meta.env.VITE_API_URL}/analytics/event`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ event: 'upgrade_view', origin: reason || 'direct' })
            }).catch(e => console.error('Analytics error', e));
        }
    }, [isOpen, pendingPix, reason]);

    // Lógica do Contador Regressivo
    useEffect(() => {
        let timer;
        if (step === 'qrcode' && pix?.expiresAt) {
            timer = setInterval(() => {
                const now = new Date().getTime();
                const end = new Date(pix.expiresAt).getTime();
                const distance = end - now;

                if (distance < 0) {
                    setCountdown("EXPIRADO");
                    setPollingActive(false);
                    savePendingPix(null);
                    setStep('plan');
                } else {
                    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                    setCountdown(`${minutes}m ${seconds}s`);
                }
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [step, pix, savePendingPix]);

    // Polling logic
    useEffect(() => {
        let timer;
        let attempts = 0;
        if (pollingActive && pix?.orderId) {
            const checkStatus = async () => {
                attempts++;
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/payments/pix/status/${pix.orderId}`, {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                    });
                    const data = await response.json();
                    if (data.status === 'PAID') {
                        setStep('confirmed');
                        setPollingActive(false);
                        savePendingPix(null);
                        toast.success("Pagamento confirmado!");
                        setTimeout(() => window.location.reload(), 3000);
                        return;
                    }
                } catch (e) {
                    console.error("Erro polling", e);
                }
                const nextInterval = (attempts * 4000) > 60000 ? 8000 : 4000;
                timer = setTimeout(checkStatus, nextInterval);
            };
            timer = setTimeout(checkStatus, 4000);
        }
        return () => clearTimeout(timer);
    }, [pollingActive, pix, savePendingPix]);

    if (!isOpen) return null;

    const handleCreatePix = async (planToSet = selectedPlan) => {
        if (step === 'plan') {
            setSelectedPlan(planToSet);
            setStep('cpf');
            return;
        }

        if (cpf.length < 11) {
            toast.error("Informe um CPF válido");
            return;
        }

        setStep('loading');
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/payments/pix`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ 
                    cpf: cpf.replace(/\D/g, ''),
                    planId: planToSet
                })
            });
            const data = await res.json();
            if (data.qrCodeBase64) {
                setPix(data);
                savePendingPix(data);
                setStep('qrcode');
                setPollingActive(true);

                fetch(`${import.meta.env.VITE_API_URL}/analytics/event`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                    body: JSON.stringify({ event: 'pix_created', metadata: { planId: planToSet } })
                }).catch(e => console.error('Analytics error', e));
            } else {
                toast.error(data.message || "Erro ao gerar PIX");
                setStep('cpf');
            }
        } catch (e) {
            toast.error("Erro de conexão");
            setStep('cpf');
        }
    };

    const handleCopy = () => {
        if (!pix?.qrCodeText) return;
        navigator.clipboard.writeText(pix.qrCodeText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.info("Código PIX copiado!");
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300 border border-white/20">
                <button onClick={closeUpgrade} className="absolute top-4 right-4 p-2 bg-slate-100/50 hover:bg-slate-200 rounded-full transition-colors z-20">
                    <X className="w-5 h-5 text-slate-500" />
                </button>

                {step === 'confirmed' ? (
                    <div className="p-8 text-center flex flex-col items-center">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                            <Check className="w-10 h-10 text-emerald-600 animate-bounce" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2 underline decoration-emerald-500 decoration-4">SUCESSO!</h2>
                        <p className="text-slate-600 mb-6 font-medium">Sua conta PRO está liberada.</p>
                        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    </div>
                ) : (
                    <>
                        <div className="bg-slate-950 p-6 pt-10 text-white relative overflow-hidden text-center">
                            <Star className="absolute -top-4 -left-4 w-24 h-24 text-amber-500/10 rotate-12" />
                            <Star className="absolute -bottom-4 -right-4 w-16 h-16 text-indigo-500/10 -rotate-12" />
                            
                            < Crown className="w-12 h-12 text-amber-500 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                            <h2 className="text-2xl font-black tracking-tighter">Upgrade PRO 💎</h2>
                            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-[0.2em] mt-1">Domine suas finanças</p>
                        </div>

                        <div className="p-8">
                            {step === 'plan' ? (
                                <div className="space-y-4">
                                    {/* PLANO ANUAL - O GRANDE DESTAQUE */}
                                    <div 
                                        onClick={() => setSelectedPlan('pro_yearly')}
                                        className={`p-5 rounded-3xl border-2 transition-all cursor-pointer relative ${selectedPlan === 'pro_yearly' ? 'border-amber-500 bg-amber-50/50 shadow-lg shadow-amber-500/10' : 'border-slate-100 hover:border-slate-200'}`}
                                    >
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-md">
                                            Melhor Custo-Benefício
                                        </div>
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="font-black text-slate-900 text-lg leading-none">Plano Anual 🏆</p>
                                            <div className="text-right">
                                                <p className="text-2xl font-black text-slate-900 leading-none">R$ 249</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Pagamento Único</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
                                            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                                            <p className="text-xs text-slate-600 font-medium">Equivale a <span className="font-black text-emerald-600 underline">R$ 20,75/mês</span></p>
                                        </div>
                                        <p className="text-[10px] text-amber-600 font-black mt-1 uppercase tracking-tighter italic">Economize R$ 110,88 por ano!</p>
                                    </div>

                                    {/* PLANO MENSAL - OPÇÃO SECUNDÁRIA */}
                                    <div 
                                        onClick={() => setSelectedPlan('pro_monthly')}
                                        className={`p-4 rounded-3xl border-2 transition-all cursor-pointer ${selectedPlan === 'pro_monthly' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-slate-700">Plano Mensal</p>
                                                <p className="text-[10px] text-slate-400 font-medium">Sem permanência</p>
                                            </div>
                                            <p className="text-lg font-black text-slate-800">R$ 29,99</p>
                                        </div>
                                    </div>

                                    <Button 
                                        onClick={() => handleCreatePix()}
                                        className={`w-full h-14 font-black text-lg rounded-2xl transition-all shadow-xl active:scale-95 flex gap-2 items-center justify-center ${selectedPlan === 'pro_yearly' ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'}`}
                                    >
                                        {selectedPlan === 'pro_yearly' ? "Garantir Plano Anual!" : "Continuar com Mensal"}
                                        <ArrowRight className="w-5 h-5" />
                                    </Button>

                                    <div className="flex flex-col items-center gap-2 pt-2">
                                        <div className="flex items-center gap-2 text-[9px] text-slate-400 font-black uppercase">
                                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Ativação Imediata via Pix
                                        </div>
                                    </div>
                                </div>
                            ) : step === 'cpf' || step === 'loading' ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 gap-1">
                                        <div className="flex justify-between items-end mb-1">
                                            <Label className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Identificação (CPF)</Label>
                                            <button onClick={() => setStep('plan')} className="text-indigo-600 text-[9px] font-black uppercase hover:underline">Voltar</button>
                                        </div>
                                        <Input 
                                            placeholder="000.000.000-00"
                                            value={cpf}
                                            onChange={(e) => setCpf(e.target.value)}
                                            className="h-14 rounded-2xl text-xl font-black border-slate-200 focus:ring-amber-500"
                                            disabled={step === 'loading'}
                                        />
                                    </div>

                                    <Button 
                                        onClick={handleCreatePix}
                                        disabled={step === 'loading'}
                                        className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-indigo-600/20"
                                    >
                                        {step === 'loading' ? <Loader2 className="w-6 h-6 animate-spin" /> : "GERAR CÓDIGO PIX"}
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-6 text-center">
                                    <div className="bg-slate-50 p-3 rounded-[2rem] inline-block shadow-inner ring-8 ring-slate-100/50">
                                        <img src={pix.qrCodeBase64} alt="PIX" className="w-44 h-44 mix-blend-multiply" />
                                    </div>

                                    <div className="flex items-center justify-center gap-4 py-2">
                                        <div className="text-center group">
                                            <p className="text-[9px] text-slate-400 uppercase font-black tracking-tight group-hover:text-indigo-500 transition-colors">Total a Pagar</p>
                                            <p className="text-2xl font-black text-slate-900">R$ {selectedPlan === 'pro_yearly' ? '249' : '29,99'}</p>
                                        </div>
                                        <div className="h-10 w-px bg-slate-100" />
                                        <div className="text-center">
                                            <p className="text-[9px] text-slate-400 uppercase font-black tracking-tight">Válido por</p>
                                            <p className="text-lg font-black text-indigo-600">{countdown}</p>
                                        </div>
                                    </div>

                                    <Button onClick={handleCopy} variant="outline" className="w-full h-14 rounded-2xl border-slate-200 font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
                                        {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                                        {copied ? "SÓ COLAR NO APP DO BANCO!" : "COPIAR CÓDIGO PIX"}
                                    </Button>
                                    
                                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-3">
                                        <Loader2 className="w-5 h-5 text-amber-500 animate-spin shrink-0" />
                                        <div className="text-left">
                                            <p className="text-amber-900 text-[10px] font-black uppercase">Monitorando Pagamento</p>
                                            <p className="text-amber-700/80 text-[10px] leading-tight font-medium">Após pagar, sua conta PRO será ativada em menos de 10 segundos.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
