import React, { useState, useEffect } from 'react';
import { useUpgrade } from '@/context/UpgradeContext';
import { 
    X, QrCode, Loader2, Check, Copy, Clock, 
    Crown, Rocket, ShieldCheck, TrendingUp 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function UpgradeModal() {
    const { isOpen, closeUpgrade, reason } = useUpgrade();
    const [step, setStep] = useState('cpf'); // cpf, loading, qrcode, confirmed
    const [cpf, setCpf] = useState('');
    const [pix, setPix] = useState(null);
    const [copied, setCopied] = useState(false);
    const [pollingActive, setPollingActive] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setStep('cpf');
            setPix(null);
            setPollingActive(false);
            
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
    }, [isOpen, reason]);

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
            }, 5000);
        }
        return () => clearInterval(timer);
    }, [pollingActive, pix, reason]);

    if (!isOpen) return null;

    const handleCreatePix = async () => {
        if (cpf.length < 11) {
            toast.error("Informe um CPF válido");
            return;
        }

        // Analytics: Clique para gerar PIX
        fetch(`${import.meta.env.VITE_API_URL || 'https://lucro-certo-api.onrender.com'}/analytics/event`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ event: 'upgrade_click', origin: reason || 'direct', metadata: { has_cpf: true } })
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
                setStep('qrcode');
                setPollingActive(true);

                // Analytics: PIX Gerado com sucesso
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
                        <h2 className="text-2xl font-black text-slate-900 mb-2">Parabéns!</h2>
                        <p className="text-slate-600 mb-6 font-medium">Sua conta foi atualizada para PRO com sucesso. Aproveite todas as ferramentas ilimitadas.</p>
                        <div className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center gap-3">
                            <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                            <p className="text-xs text-slate-500 font-medium">Recarregando o sistema para liberar o acesso...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="bg-slate-900 p-6 pt-10 text-white relative overflow-hidden text-center">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-indigo-500 to-purple-500"></div>
                            <Crown className="w-12 h-12 text-amber-500 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                            <h2 className="text-2xl font-black tracking-tight">Assinatura PRO 💎</h2>
                            <p className="text-slate-400 text-xs uppercase tracking-widest font-bold mt-1">Liberação Imediata via PIX</p>
                            
                            {reason && (
                                <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-amber-200 font-medium leading-relaxed">
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
                                            className="h-12 rounded-xl text-lg font-bold"
                                            disabled={step === 'loading'}
                                        />
                                        <p className="text-[10px] text-slate-400">Exigido para emissão segura do PIX via PagBank.</p>
                                    </div>

                                    <Button 
                                        onClick={handleCreatePix}
                                        disabled={step === 'loading'}
                                        className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
                                    >
                                        {step === 'loading' ? (
                                            <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Gerando...</>
                                        ) : (
                                            "Assinar PRO agora - R$ 29,99"
                                        )}
                                    </Button>

                                    <div className="space-y-3 pt-2">
                                        {[
                                            { icon: TrendingUp, text: "Ganhos automáticos +30%" },
                                            { icon: ShieldCheck, text: "Diga adeus ao prejuízo" },
                                            { icon: Rocket, text: "Vendas e Produtos ilimitados" }
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-2 text-slate-600 font-medium text-xs">
                                                <item.icon className="w-4 h-4 text-emerald-500" />
                                                {item.text}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6 text-center">
                                    <div className="mx-auto border-4 border-slate-50 rounded-3xl p-3 inline-block bg-white shadow-inner">
                                        <img src={pix.qrCodeBase64} alt="PIX" className="w-48 h-48" />
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-xs text-slate-500 uppercase font-bold tracking-tighter">Valor do Investimento</p>
                                        <p className="text-4xl font-black text-slate-900">R$ 29,99</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Button 
                                            onClick={handleCopy}
                                            variant="outline"
                                            className="w-full h-12 rounded-xl border-slate-200 text-slate-700 font-bold flex items-center justify-center gap-2"
                                        >
                                            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                            {copied ? "Código Copiado!" : "Copiar Código PIX"}
                                        </Button>
                                    </div>

                                    <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-center gap-3">
                                        <Loader2 className="w-5 h-5 text-indigo-500 animate-spin shrink-0" />
                                        <div className="text-left">
                                            <p className="text-indigo-900 text-sm font-bold">Aguardando Pagamento</p>
                                            <p className="text-indigo-700/70 text-[10px]">Após o pagamento, sua conta PRO será ativada instantaneamente.</p>
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
