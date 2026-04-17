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
    const [abVariant, setAbVariant] = useState(null); 
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
        if (!abVariant) return; // Esperar decidir a variante
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

    useEffect(() => {
        if (isOpen) {
            const initModal = async () => {
                startTimeRef.current = Date.now();
                closeAttemptsRef.current = 0;

                // Decisão Automática de Variante (Backend Decision Engine)
                try {
                    const res = await fetch(`${import.meta.env.VITE_API_URL}/analytics/active-variants`, {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                    });
                    const decisions = await res.json();
                    const activeVariant = decisions[userSegment] === 'RANDOM' 
                        ? (Math.random() > 0.5 ? 'A' : 'B') 
                        : decisions[userSegment];
                    
                    setAbVariant(activeVariant);

                    if (pendingPix && new Date(pendingPix.expiresAt) > new Date()) {
                        setPix(pendingPix);
                        setStep('qrcode');
                        setPollingActive(true);
                    } else {
                        setStep('plan');
                        // Aplicação do Default por Segmento corrigido pela variante
                        // Se for variante A ou B, aqui mantemos a lógica anterior mas guiada pelo backend
                        if (userSegment === 'high' || userSegment === 'medium') {
                            setSelectedPlan(activeVariant === 'A' ? 'pro_yearly' : 'pro_yearly'); 
                        } else {
                            setSelectedPlan(activeVariant === 'A' ? 'pro_monthly' : 'pro_monthly');
                        }
                        setPix(null);
                        setPollingActive(false);
                    }
                } catch (e) {
                    setAbVariant('A');
                    setStep('plan');
                }
            };

            initModal();
        }
    }, [isOpen, userSegment, pendingPix]);

    // Rastrear view apenas após decidir variante
    useEffect(() => {
        if (isOpen && abVariant) {
            trackEvent('upgrade_view');
        }
    }, [isOpen, abVariant]);

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

    if (!isOpen || !abVariant) return null;

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
            setStep('cpf');
        }
    };

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
                <button onClick={() => { trackEvent('upgrade_close'); closeUpgrade(); }} className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors z-20">
                    <X className="w-5 h-5 text-slate-500" />
                </button>

                {step === 'confirmed' ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <div className="w-24 h-24 bg-emerald-100 rounded-full mb-6 flex items-center justify-center">
                            <Check className="w-12 h-12 text-emerald-600 animate-bounce" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-2 italic">ACESSO ATIVO!</h2>
                    </div>
                ) : (
                    <>
                        <div className="bg-slate-950 p-6 pt-12 text-white relative overflow-hidden text-center">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 via-indigo-500 to-purple-500"></div>
                            {userSegment === 'high' ? (
                                <>
                                    <Target className="w-14 h-14 text-amber-500 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                                    <h2 className="text-2xl font-black italic">AUMENTE SEU RETORNO 📈</h2>
                                </>
                            ) : (
                                <>
                                    <Shield className="w-14 h-14 text-indigo-500 mx-auto mb-4" />
                                    <h2 className="text-2xl font-black italic">PRO COM SEGURANÇA 🛡️</h2>
                                </>
                            )}
                        </div>

                        <div className="p-10">
                            {step === 'plan' ? (
                                <div className="space-y-4">
                                    <div 
                                        onClick={() => setSelectedPlan('pro_yearly')}
                                        className={`p-6 rounded-3xl border-2 transition-all cursor-pointer relative ${selectedPlan === 'pro_yearly' ? 'border-amber-500 bg-amber-50/50 shadow-xl' : 'border-slate-100 hover:border-slate-200'}`}
                                    >
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter shadow-lg">
                                            Melhor Escolha
                                        </div>
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="font-black text-slate-900 text-xl leading-none italic">Anual 🏆</p>
                                            <p className="text-2xl font-black text-slate-900">R$ 249</p>
                                        </div>
                                        {paybackRange && (
                                            <div className="mt-4 bg-white/60 p-3 rounded-2xl flex items-center gap-2">
                                                <Zap className="w-5 h-5 text-emerald-600 fill-emerald-600 animate-pulse" />
                                                <p className="text-[11px] text-emerald-900 font-black uppercase italic">
                                                    Retorno em {paybackRange.start}–{paybackRange.end} dias
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div 
                                        onClick={() => setSelectedPlan('pro_monthly')}
                                        className={`p-5 rounded-3xl border-2 transition-all cursor-pointer ${selectedPlan === 'pro_monthly' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <p className="font-black text-slate-700 italic">Mensal</p>
                                            <p className="text-lg font-black text-slate-800">R$ 29,99</p>
                                        </div>
                                    </div>

                                    <Button onClick={() => handleCreatePix()} className="w-full h-16 bg-slate-950 text-white font-black text-xl rounded-3xl shadow-2xl uppercase italic">
                                        Continuar
                                    </Button>
                                    <p className="text-[9px] text-slate-400 font-black uppercase text-center tracking-widest flex items-center justify-center gap-1">
                                        <ShieldCheck className="w-3.5 h-3.5" /> Ativação em segundos via Pix
                                    </p>
                                </div>
                            ) : step === 'cpf' || step === 'loading' ? (
                                <div className="space-y-6 text-center">
                                    <Input placeholder="CPF para identificação" value={cpf} onChange={(e) => setCpf(e.target.value)} className="h-16 rounded-[1.5rem] text-2xl font-black text-center" />
                                    <Button onClick={handleCreatePix} disabled={step === 'loading'} className="w-full h-16 bg-slate-950 text-white font-black text-lg rounded-3xl">
                                        {step === 'loading' ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "GERAR PIX"}
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-8 text-center">
                                    <img src={pix.qrCodeBase64} alt="PIX" className="w-48 h-48 mx-auto mix-blend-multiply bg-slate-50 p-4 rounded-3xl" />
                                    <Button onClick={() => { navigator.clipboard.writeText(pix.qrCodeText); setCopied(true); setTimeout(() => setCopied(false), 2000); }} variant="outline" className="w-full h-16 rounded-3xl font-black">{copied ? "COPIADO!" : "COPIAR CÓDIGO PIX"}</Button>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center justify-center gap-2">
                                        <Clock className="w-4 h-4" /> Aguardando pagamento ({countdown})
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
