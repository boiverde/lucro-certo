import React, { useState, useEffect } from 'react';
import { useUpgrade } from '@/context/UpgradeContext';
import { 
    X, QrCode, Loader2, Check, Copy, Clock, 
    Crown, Rocket, ShieldCheck, TrendingUp, AlertCircle, Calendar
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
    const [selectedPlan, setSelectedPlan] = useState('pro_monthly');
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

    // Lógica de Polling do Pagamento com Backoff
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
                        toast.success("Pagamento confirmado! Plano PRO ativado.");
                        
                        setTimeout(() => window.location.reload(), 3000);
                        return;
                    }

                    if (data.status === 'UNKNOWN' && attempts > 3) {
                        toast.error("Cobrança não localizada.");
                        setPollingActive(false);
                        savePendingPix(null);
                        setStep('plan');
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

    const handleCreatePix = async () => {
        if (cpf.length < 11) {
            toast.error("Informe um CPF válido");
            return;
        }

        fetch(`${import.meta.env.VITE_API_URL}/analytics/event`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ 
                event: 'upgrade_click', 
                origin: reason || 'direct',
                metadata: { planId: selectedPlan }
            })
        }).catch(e => console.error('Analytics error', e));

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
                    planId: selectedPlan
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
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ 
                        event: 'pix_created', 
                        origin: reason || 'direct', 
                        metadata: { orderId: data.orderId, planId: selectedPlan } 
                    })
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
            <div className="bg-white w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
                <button 
                    onClick={closeUpgrade}
                    className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors z-20"
                >
                    <X className="w-5 h-5 text-slate-500" />
                </button>

                {step === 'confirmed' ? (
                    <div className="p-8 text-center flex flex-col items-center">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                            <Check className="w-10 h-10 text-emerald-600 animate-bounce" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2">PAGAMENTO CONFIRMADO!</h2>
                        <p className="text-slate-600 mb-6 font-medium">Sua conta foi atualizada para PRO. Carregando recursos exclusivos...</p>
                        <div className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center gap-3">
                            <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                            <p className="text-xs text-slate-500 font-medium">Redirecionando...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="bg-slate-900 p-6 pt-10 text-white relative overflow-hidden text-center">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-indigo-500 to-purple-500"></div>
                            <Crown className="w-12 h-12 text-amber-500 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                            <h2 className="text-2xl font-black tracking-tight">Assinatura PRO 💎</h2>
                            
                            {lucroPotencial > 0 && (
                                <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center justify-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                                    <span className="text-xs font-bold text-emerald-100">Potencial de Ganho: +R$ {lucroPotencial.toLocaleString('pt-BR')}</span>
                                </div>
                            )}
                        </div>

                        <div className="p-8">
                            {step === 'plan' ? (
                                <div className="space-y-4">
                                    <p className="text-sm text-slate-500 font-bold uppercase tracking-tight text-center">Escolha seu Plano</p>
                                    
                                    <div 
                                        onClick={() => setSelectedPlan('pro_monthly')}
                                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${selectedPlan === 'pro_monthly' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-black text-slate-900">PRO Mensal</p>
                                                <p className="text-xs text-slate-500">Renovação a cada 30 dias</p>
                                            </div>
                                            <p className="text-lg font-black text-slate-900">R$ 29,99</p>
                                        </div>
                                    </div>

                                    <div 
                                        onClick={() => setSelectedPlan('pro_yearly')}
                                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden ${selectedPlan === 'pro_yearly' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                                    >
                                        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded-bl-xl uppercase">
                                            -30% Economia
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-black text-slate-900">PRO Anual 🏆</p>
                                                <p className="text-xs text-slate-500">Apenas R$ 20,75/mês</p>
                                            </div>
                                            <p className="text-lg font-black text-slate-900">R$ 249,00</p>
                                        </div>
                                    </div>

                                    <Button 
                                        onClick={() => setStep('cpf')}
                                        className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
                                    >
                                        Continuar
                                    </Button>
                                    
                                    <div className="flex items-center justify-center gap-4 pt-2">
                                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase"><ShieldCheck className="w-3 h-3" /> Seguro</div>
                                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase"><Calendar className="w-3 h-3" /> Flexível</div>
                                    </div>
                                </div>
                            ) : step === 'cpf' || step === 'loading' ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 gap-2">
                                        <div className="flex justify-between items-end">
                                            <Label className="text-slate-500 text-xs font-bold uppercase tracking-tight">CPF do Pagador</Label>
                                            <button onClick={() => setStep('plan')} className="text-indigo-600 text-[10px] font-black uppercase hover:underline">Trocar Plano</button>
                                        </div>
                                        <Input 
                                            placeholder="000.000.000-00"
                                            value={cpf}
                                            onChange={(e) => setCpf(e.target.value)}
                                            className="h-12 rounded-xl text-lg font-bold border-slate-200"
                                            disabled={step === 'loading'}
                                        />
                                    </div>

                                    <Button 
                                        onClick={handleCreatePix}
                                        disabled={step === 'loading'}
                                        className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-indigo-600/20"
                                    >
                                        {step === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : "GERAR PIX AGORA"}
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-6 text-center">
                                    <div className="relative mx-auto border-4 border-slate-50 rounded-3xl p-3 inline-block bg-white shadow-inner">
                                        <img src={pix.qrCodeBase64} alt="PIX" className="w-48 h-48" />
                                    </div>

                                    <div className="flex items-center justify-center gap-4">
                                        <div className="text-center">
                                            <p className="text-[10px] text-slate-400 uppercase font-black">Expira em</p>
                                            <p className="text-lg font-black text-indigo-600">{countdown}</p>
                                        </div>
                                        <div className="h-8 w-px bg-slate-100" />
                                        <div className="text-center">
                                            <p className="text-[10px] text-slate-400 uppercase font-black">Total ({selectedPlan === 'pro_yearly' ? 'Anual' : 'Mensal'})</p>
                                            <p className="text-lg font-black text-slate-900">R$ {selectedPlan === 'pro_yearly' ? '249,00' : '29,99'}</p>
                                        </div>
                                    </div>

                                    <Button onClick={handleCopy} variant="outline" className="w-full h-12 rounded-xl border-slate-200 font-bold flex items-center justify-center gap-2">
                                        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                        {copied ? "COPIADO!" : "COPIAR CÓDIGO PIX"}
                                    </Button>
                                    
                                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center gap-3">
                                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin shrink-0" />
                                        <div className="text-left font-bold">
                                            <p className="text-blue-900 text-[10px] uppercase">Aguardando Pagamento</p>
                                            <p className="text-blue-700/70 text-[10px]">Após o pagamento, o acesso será liberado.</p>
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
