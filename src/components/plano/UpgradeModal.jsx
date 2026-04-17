import React, { useState, useEffect } from 'react';
import { useUpgrade } from '@/context/UpgradeContext';
import { 
    X, QrCode, Loader2, Check, Copy, Clock, 
    Crown, Rocket, ShieldCheck, TrendingUp, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { httpClient } from '@/api/httpClient';
import { useQuery } from "@tanstack/react-query";

export default function UpgradeModal() {
    const { isOpen, closeUpgrade, reason, pendingPix, savePendingPix } = useUpgrade();
    const [step, setStep] = useState('cpf'); // cpf, loading, qrcode, confirmed
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
                setStep('cpf');
                setPix(null);
                setPollingActive(false);
            }
            
            // Analytics: Visualização do Modal
            fetch(`${import.meta.env.VITE_API_URL || 'https://lucro-certo-api.onrender.com'}/analytics/event`, {
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
                    setStep('cpf');
                } else {
                    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                    setCountdown(`${minutes}m ${seconds}s`);
                }
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [step, pix, savePendingPix]);

    // Lógica de Polling do Pagamento
    useEffect(() => {
        let timer;
        if (pollingActive && pix?.orderId) {
            timer = setInterval(async () => {
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://lucro-certo-api.onrender.com'}/payments/pix/status/${pix.orderId}`, {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                    });
                    const data = await response.json();
                    if (data.status === 'PAID') {
                        setStep('confirmed');
                        setPollingActive(false);
                        savePendingPix(null); // Limpar persistência
                        toast.success("Pagamento confirmado! Plano PRO ativado.");
                        
                        // Analytics: Pagamento Confirmado
                        fetch(`${import.meta.env.VITE_API_URL || 'https://lucro-certo-api.onrender.com'}/analytics/event`, {
                            method: 'POST',
                            headers: { 
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            },
                            body: JSON.stringify({ event: 'pix_paid', origin: reason || 'direct', metadata: { orderId: pix.orderId } })
                        }).catch(e => console.error('Analytics error', e));

                        setTimeout(() => {
                            window.location.reload(); 
                        }, 3000);
                    }
                } catch (e) {
                    console.error("Erro polling", e);
                }
            }, 4000);
        }
        return () => clearInterval(timer);
    }, [pollingActive, pix, reason, savePendingPix]);

    if (!isOpen) return null;

    const handleCreatePix = async () => {
        if (cpf.length < 11) {
            toast.error("Informe um CPF válido");
            return;
        }

        fetch(`${import.meta.env.VITE_API_URL || 'https://lucro-certo-api.onrender.com'}/analytics/event`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ event: 'upgrade_click', origin: reason || 'direct' })
        }).catch(e => console.error('Analytics error', e));

        setStep('loading');
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://lucro-certo-api.onrender.com'}/payments/pix`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ 
                    cpf: cpf.replace(/\D/g, '')
                })
            });
            const data = await res.json();
            if (data.qrCodeBase64) {
                setPix(data);
                savePendingPix(data); // Salvar para recuperação
                setStep('qrcode');
                setPollingActive(true);

                fetch(`${import.meta.env.VITE_API_URL || 'https://lucro-certo-api.onrender.com'}/analytics/event`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ event: 'pix_created', origin: reason || 'direct', metadata: { orderId: data.orderId } })
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
                            <p className="text-xs text-slate-500 font-medium">Redirecionando para as novas ferramentas...</p>
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

                            {reason && !lucroPotencial && (
                                <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-300">
                                    "{reason}"
                                </div>
                            )}
                        </div>

                        <div className="p-8">
                            {step === 'cpf' || step === 'loading' ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 gap-2">
                                        <Label className="text-slate-500 text-xs font-bold uppercase tracking-tight">CPF do Pagador</Label>
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
                                        {step === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : "GERAR QR CODE PIX - R$ 29,99"}
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-6 text-center">
                                    <div className="relative mx-auto border-4 border-slate-50 rounded-3xl p-3 inline-block bg-white shadow-inner">
                                        <img src={pix.qrCodeBase64} alt="PIX" className="w-48 h-48" />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-white/90 rounded-3xl pointer-events-none">
                                            <QrCode className="w-12 h-12 text-slate-900" />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-center gap-4">
                                        <div className="text-center">
                                            <p className="text-[10px] text-slate-400 uppercase font-black">Expira em</p>
                                            <p className="text-lg font-black text-indigo-600">{countdown}</p>
                                        </div>
                                        <div className="h-8 w-px bg-slate-100" />
                                        <div className="text-center">
                                            <p className="text-[10px] text-slate-400 uppercase font-black">Valor Total</p>
                                            <p className="text-lg font-black text-slate-900">R$ 29,99</p>
                                        </div>
                                    </div>

                                    <Button 
                                        onClick={handleCopy}
                                        variant="outline"
                                        className="w-full h-12 rounded-xl border-slate-200 text-slate-700 font-bold flex items-center justify-center gap-2 hover:bg-slate-50"
                                    >
                                        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                        {copied ? "COPIADO!" : "COPIAR CÓDIGO PIX"}
                                    </Button>

                                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                                            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-blue-900 text-xs font-black uppercase">Sincronizando PagBank</p>
                                            <p className="text-blue-700/70 text-[10px] leading-tight font-medium">O plano PRO será ativado em segundos após o pagamento.</p>
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
