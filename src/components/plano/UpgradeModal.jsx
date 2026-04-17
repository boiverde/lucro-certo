import React, { useState, useEffect, useRef } from 'react';
import { useUpgrade } from '@/context/UpgradeContext';
import { 
    X, QrCode, Loader2, Check, Copy, Clock, 
    Crown, Rocket, ShieldCheck, TrendingUp, AlertCircle, Calendar,
    ArrowRight, Star, Zap, Info, Shield, Target, Timer
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
    const [selectedPlan, setSelectedPlan] = useState(null); 
    const [abVariant, setAbVariant] = useState('A'); 
    const [cpf, setCpf] = useState('');
    const [pix, setPix] = useState(null);
    const [copied, setCopied] = useState(false);
    const [pollingActive, setPollingActive] = useState(false);
    const [countdown, setCountdown] = useState("");
    
    // Tracking Comportamental
    const startTimeRef = useRef(null);
    const closeAttemptsRef = useRef(0);

    const { data: dashboardStats } = useQuery({
        queryKey: ['dashboard-stats-mini'],
        queryFn: async () => await httpClient('/dashboard/stats'),
        enabled: isOpen,
    });

    const lucroPotencialMensal = dashboardStats?.insights?.lucroPotencial || 0;
    const userSegment = lucroPotencialMensal > 1000 ? 'high' : (lucroPotencialMensal > 300 ? 'medium' : 'low');

    const trackEvent = (event, metadata = {}) => {
        const timeInModal = startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current) / 1000) : 0;
        fetch(`${import.meta.env.VITE_API_URL}/analytics/event`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify({ 
                event, 
                origin: reason || 'direct',
                metadata: { 
                    ...metadata, 
                    ab_variant: abVariant, 
                    user_segment: userSegment,
                    time_in_modal: timeInModal,
                    close_attempts: closeAttemptsRef.current
                }
            })
        }).catch(e => console.error('Analytics error', e));
    };

    const handleClose = () => {
        if (step === 'qrcode' && pix) {
            trackEvent('pix_abandonment', { orderId: pix.orderId });
        }
        trackEvent('upgrade_close');
        closeUpgrade();
    };

    useEffect(() => {
        if (isOpen) {
            startTimeRef.current = Date.now();
            closeAttemptsRef.current = 0;
            const variant = Math.random() > 0.5 ? 'A' : 'B';
            setAbVariant(variant);

            if (pendingPix && new Date(pendingPix.expiresAt) > new Date()) {
                setPix(pendingPix);
                setStep('qrcode');
                setPollingActive(true);
            } else {
                setStep('plan');
                if (userSegment === 'high' || userSegment === 'medium') {
                    setSelectedPlan('pro_yearly');
                } else {
                    setSelectedPlan('pro_monthly');
                }
                setPix(null);
                setPollingActive(false);
            }
            trackEvent('upgrade_view');
        }
    }, [isOpen, pendingPix, reason, userSegment]);

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
                        trackEvent('pix_paid_success', { orderId: pix.orderId });
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

    const handleCreatePix = async (planToSet = selectedPlan) => {
        if (!planToSet) {
            toast.info("Selecione um plano");
            return;
        }
        if (step === 'plan') {
            setStep('cpf');
            trackEvent('plan_submit', { planId: planToSet });
            return;
        }
        setStep('loading');
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/payments/pix`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({ cpf: cpf.replace(/\D/g, ''), planId: planToSet })
            });
            const data = await res.json();
            if (data.qrCodeBase64) {
                setPix(data);
                savePendingPix(data);
                setStep('qrcode');
                setPollingActive(true);
                trackEvent('pix_created', { orderId: data.orderId, planId: planToSet });
            } else {
                toast.error(data.message || "Erro ao gerar PIX");
                setStep('cpf');
            }
        } catch (e) {
            toast.error("Erro de conexão");
            setStep('cpf');
        }
    };

    if (!isOpen) return null;

    const getPaybackRange = () => {
        if (lucroPotencialMensal <= 0) return null;
        const dailyMax = lucroPotencialMensal / 30;
        const dailyMin = dailyMax * 0.6;
        return { start: Math.ceil(249 / dailyMax), end: Math.ceil(249 / dailyMin) };
    };
    const paybackRange = getPaybackRange();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-500">
            <div className="bg-white w-full max-w-sm rounded-[3rem] overflow-hidden shadow-2xl relative border border-white/20">
                <button onClick={handleClose} className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors z-20">
                    <X className="w-5 h-5 text-slate-500" />
                </button>

                {step === 'confirmed' ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <div className="w-24 h-24 bg-emerald-100 rounded-full mb-6 flex items-center justify-center">
                            <Check className="w-12 h-12 text-emerald-600 animate-bounce" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-2 italic">LIBERADO!</h2>
                        <p className="text-slate-500 font-medium">Sua conta foi atualizada.</p>
                    </div>
                ) : (
                    <>
                        <div className="bg-slate-950 p-6 pt-12 text-white relative overflow-hidden text-center">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 via-indigo-500 to-purple-500"></div>
                            
                            {userSegment === 'high' ? (
                                <>
                                    <Target className="w-14 h-14 text-amber-500 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                                    <h2 className="text-2xl font-black italic">ESTIMATIVA DE ROI REAL 📈</h2>
                                    <p className="text-amber-500/80 text-[10px] font-black uppercase mt-2">Baseado nos seus dados acumulados.</p>
                                </>
                            ) : userSegment === 'medium' ? (
                                <>
                                    <Crown className="w-14 h-14 text-amber-500 mx-auto mb-4" />
                                    <h2 className="text-2xl font-black italic">IMPULSIONE SEU LUCRO 💎</h2>
                                    <p className="text-slate-400 text-[10px] uppercase font-bold mt-2 tracking-[0.2em]">Sua empresa em outro nível.</p>
                                </>
                            ) : (
                                <>
                                    <Shield className="w-14 h-14 text-indigo-500 mx-auto mb-4" />
                                    <h2 className="text-2xl font-black italic tracking-tighter text-white">TESTE SEM RISCOS 🛡️</h2>
                                    <p className="text-slate-400 text-[10px] uppercase font-bold mt-2">Descubra todo o potencial PRO.</p>
                                </>
                            )}
                        </div>

                        <div className="p-10">
                            {step === 'plan' ? (
                                <div className="space-y-4">
                                    <p className="text-sm text-slate-500 font-bold uppercase tracking-tight text-center">Planos Recomendados</p>
                                    
                                    {/* PLANO ANUAL */}
                                    <div 
                                        onClick={() => setSelectedPlan('pro_yearly')}
                                        className={`p-6 rounded-3xl border-2 transition-all cursor-pointer relative ${selectedPlan === 'pro_yearly' ? 'border-amber-500 bg-amber-50/50 shadow-xl' : 'border-slate-100 hover:border-slate-200'}`}
                                    >
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter shadow-lg">
                                            Melhor Custo-Benefício
                                        </div>
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="font-black text-slate-900 text-xl leading-none italic">PRO Anual 🏆</p>
                                            <p className="text-2xl font-black text-slate-900">R$ 249</p>
                                        </div>
                                        
                                        {paybackRange && (
                                            <div className="mt-4 bg-white/60 p-3 rounded-2xl border border-emerald-100 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Zap className="w-5 h-5 text-emerald-600 fill-emerald-600 animate-pulse" />
                                                    <p className="text-[11px] text-emerald-900 font-black uppercase italic">
                                                        Retorno em {paybackRange.start}–{paybackRange.end} dias*
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="flex items-center gap-1 mt-2 text-[8px] text-slate-400 font-bold uppercase">
                                            <Info className="w-3 h-3" /> *Estimativa baseada no seu lucro potencial.
                                        </div>
                                    </div>

                                    <div 
                                        onClick={() => setSelectedPlan('pro_monthly')}
                                        className={`p-5 rounded-3xl border-2 transition-all cursor-pointer ${selectedPlan === 'pro_monthly' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <p className="font-black text-slate-700 italic">PRO Mensal</p>
                                            <p className="text-lg font-black text-slate-800">R$ 29,99</p>
                                        </div>
                                    </div>

                                    <Button 
                                        onClick={() => handleCreatePix()}
                                        className={`w-full h-16 font-black text-xl rounded-3xl transition-all shadow-2xl active:scale-95 flex gap-2 items-center justify-center uppercase italic ${selectedPlan === 'pro_yearly' ? 'bg-amber-500 hover:bg-amber-600 text-slate-950' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                                    >
                                        {userSegment === 'high' ? "Resgatar Meu Lucro PRO" : "Liberar Acesso PRO"}
                                        <ArrowRight className="w-6 h-6" />
                                    </Button>
                                </div>
                            ) : step === 'cpf' || step === 'loading' ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 gap-1">
                                        <div className="flex justify-between items-end mb-1">
                                            <Label className="text-slate-400 text-[10px] font-black uppercase italic">CPF para identificação</Label>
                                            <button onClick={() => setStep('plan')} className="text-indigo-600 text-[10px] font-black uppercase underline">Voltar</button>
                                        </div>
                                        <Input placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(e.target.value)} className="h-16 rounded-[1.5rem] text-2xl font-black text-center" disabled={step === 'loading'} />
                                    </div>
                                    <Button onClick={handleCreatePix} disabled={step === 'loading'} className="w-full h-16 bg-slate-900 text-white font-black text-lg rounded-3xl">
                                        {step === 'loading' ? <Loader2 className="w-6 h-6 animate-spin" /> : "GERAR CÓDIGO PIX"}
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-8 text-center pb-4">
                                    <div className="bg-slate-50 p-4 rounded-[3rem] inline-block shadow-inner ring-12 ring-slate-100/50">
                                        <img src={pix.qrCodeBase64} alt="PIX" className="w-48 h-48 mix-blend-multiply" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-center">
                                        <div className="bg-slate-50 p-4 rounded-3xl">
                                            <p className="text-[10px] text-slate-400 uppercase font-black">Total</p>
                                            <p className="text-xl font-black text-slate-900">R$ {selectedPlan === 'pro_yearly' ? '249' : '29,99'}</p>
                                        </div>
                                        <div className="bg-indigo-50 p-4 rounded-3xl">
                                            <p className="text-[10px] text-indigo-400 uppercase font-black">Expira em</p>
                                            <p className="text-xl font-black text-indigo-600">{countdown}</p>
                                        </div>
                                    </div>
                                    <Button onClick={() => { navigator.clipboard.writeText(pix.qrCodeText); setCopied(true); setTimeout(() => setCopied(false), 2000); }} variant="outline" className="w-full h-16 rounded-3xl border-2 font-black">
                                        {copied ? "COPIADO!" : "COPIAR CÓDIGO PIX"}
                                    </Button>
                                    <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase">
                                        <Timer className="w-4 h-4" /> Pagamento identificado em segundos
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
