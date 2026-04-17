import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Zap, CheckCircle2, Crown, Rocket, ShieldCheck, ArrowRight, QrCode, Copy, Check, Loader2, Clock, BarChart3, Store, Users } from 'lucide-react';
import { usePlan } from '@/api/usePlan';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { httpClient } from '@/api/httpClient';
import { toast } from 'sonner';

const POLL_INTERVAL_MS = 5000;
const MAX_POLLS = 36; // 3 minutos

const BENEFITS_PRO = [
    'Vendas ilimitadas',
    'Sem bloqueio mensal',
    'Plano premium ativo',
];

export default function Plano() {
    const { plan, loading, refresh } = usePlan();
    const [step, setStep] = useState('idle'); // 'idle' | 'cpf' | 'loading' | 'qrcode' | 'confirmed'
    const [cpf, setCpf] = useState('');
    const [pix, setPix] = useState(null);
    const [pollCount, setPollCount] = useState(0);
    const [copied, setCopied] = useState(false);
    const pollRef = useRef(null);

    // ── Polling ────────────────────────────────────────────────────
    const stopPolling = useCallback(() => {
        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    }, []);

    const checkPixStatus = useCallback(async (orderId, count) => {
        if (count >= MAX_POLLS) {
            stopPolling();
            toast.warning('PIX expirado', { description: 'Gere um novo código para tentar novamente.' });
            setStep('idle');
            return;
        }
        try {
            const data = await httpClient(`/payments/pix/status/${orderId}`);
            if (data?.status === 'PAID') {
                stopPolling();
                setStep('confirmed');
                if (refresh) refresh(); // Atualiza cache global do plano
            }
        } catch { /* silencia */ }
    }, [stopPolling]);

    useEffect(() => {
        if (step === 'qrcode' && pix?.orderId) {
            let count = pollCount;
            pollRef.current = setInterval(() => {
                count++;
                setPollCount(count);
                checkPixStatus(pix.orderId, count);
            }, POLL_INTERVAL_MS);
        }
        return stopPolling;
    }, [step, pix]);

    // ── Confirmado ─────────────────────────────────────────────────
    useEffect(() => {
        if (step === 'confirmed') {
            toast.success('🎉 Plano Pro ativado!', { description: 'Suas vendas agora são ilimitadas!' });
            const t = setTimeout(() => window.location.reload(), 3000);
            return () => clearTimeout(t);
        }
    }, [step]);

    // ── Gerar Pix ──────────────────────────────────────────────────
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
            setStep('qrcode');
        } catch (err) {
            toast.error('Erro ao gerar PIX', {
                description: typeof err?.data?.message === 'string' ? err.data.message : 'Não foi possível criar a cobrança. Tente novamente.'
            });
            setStep('cpf');
        }
    };

    const handleCopy = () => {
        if (!pix?.qrCodeText) return;
        navigator.clipboard.writeText(pix.qrCodeText).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        });
    };

    // ── Loading inicial ────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
            </div>
        );
    }

    // ── PLANO PRO ──────────────────────────────────────────────────
    if (plan === 'pro' || step === 'confirmed') {
        const { expiresAt } = usePlan();
        
        let daysRemaining = 0;
        if (expiresAt) {
            const now = new Date();
            const exp = new Date(expiresAt);
            const diffTime = exp.getTime() - now.getTime();
            daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        }

        return (
            <div className="max-w-xl mx-auto px-4 py-8">
                {/* Header Card Premium */}
                <div className="relative rounded-[2rem] overflow-hidden shadow-2xl bg-slate-900 border border-slate-800 mb-6">
                    {/* Background decorativo */}
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Crown className="w-40 h-40 text-yellow-500" />
                    </div>
                    
                    <div className="p-8 relative z-10 flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/20 mb-4 rotate-3">
                            <Crown className="w-12 h-12 text-white" />
                        </div>
                        
                        <h1 className="text-3xl font-black text-white tracking-tight">Assinatura PRO</h1>
                        <p className="text-slate-400 mt-1">Status: <span className="text-emerald-400 font-bold uppercase text-xs">Ativo e Vitalício</span></p>
                        
                        {/* Indicador de dias */}
                        <div className="mt-8 grid grid-cols-1 w-full gap-4">
                            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 flex flex-col items-center">
                                <span className="text-xs text-slate-500 uppercase font-black tracking-widest mb-1">Validade do Periodo</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black text-white">{daysRemaining || 30}</span>
                                    <span className="text-slate-500 font-medium">dias</span>
                                </div>
                                <div className="w-full bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-emerald-500 to-green-400" 
                                        style={{ width: `${(daysRemaining / 30) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid de benefícios expandido */}
                <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-emerald-500" />
                        Vantagens Ativadas
                    </h2>
                    
                    <div className="grid grid-cols-1 gap-4">
                        {[
                            { title: 'Vendas Ilimitadas', desc: 'Registre quantas vendas precisar sem bloqueios.', icon: Zap },
                            { title: 'Relatórios Avançados', desc: 'Acesso total a gráficos de lucro e desempenho.', icon: BarChart3 },
                            { title: 'Gestão de Estoque Pro', desc: 'Controle de lotes e alertas de reposição.', icon: Store },
                            { title: 'Suporte Prioritário', desc: 'Fale com nossa equipe com prioridade máxima.', icon: Users },
                        ].map((b, idx) => (
                            <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 items-start">
                                <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm">
                                    <b.icon className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-sm">{b.title}</h3>
                                    <p className="text-gray-500 text-xs leading-relaxed">{b.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                        <p className="text-emerald-800 text-sm text-center font-medium italic">
                            "Seu negócio agora tem asas para voar. Sucesso nas vendas!" 📈
                        </p>
                    </div>
                </div>

                <p className="text-center text-slate-400 text-[10px] mt-8 uppercase tracking-widest font-bold">
                    ID da transação: {pix?.orderId || 'SESSÃO_ATIVA'}
                </p>
            </div>
        );
    }

    // ── QR CODE + Aguardando pagamento ─────────────────────────────
    if (step === 'qrcode' && pix) {
        const expiresDate = pix.expiresAt ? new Date(pix.expiresAt) : null;
        return (
            <div className="max-w-xl mx-auto px-4 py-10">
                <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-6 flex flex-col items-center text-white text-center">
                        <QrCode className="w-12 h-12 mb-3" />
                        <h1 className="text-xl font-extrabold">Pague via PIX</h1>
                        <p className="text-blue-200 text-sm mt-1">Leia o QR Code ou use o código copia e cola</p>
                    </div>

                    <div className="bg-white p-8 space-y-6">
                        {/* QR Code */}
                        <div className="flex justify-center">
                            <div className="border-4 border-slate-100 rounded-xl p-2">
                                <img
                                    src={pix.qrCodeBase64}
                                    alt="QR Code PIX"
                                    className="w-52 h-52 object-contain"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            </div>
                        </div>

                        {/* Valor e expiração */}
                        <div className="text-center">
                            <p className="text-3xl font-extrabold text-gray-900">R$ 29,99</p>
                            {expiresDate && (
                                <p className="text-gray-400 text-sm flex items-center justify-center gap-1 mt-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    Expira às {expiresDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            )}
                        </div>

                        {/* Copia e cola */}
                        <div className="space-y-2">
                            <Label className="text-gray-500 text-xs">Código PIX Copia e Cola</Label>
                            <div className="flex gap-2">
                                <input
                                    readOnly
                                    value={pix.qrCodeText}
                                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 bg-gray-50 truncate"
                                />
                                <Button
                                    size="sm"
                                    onClick={handleCopy}
                                    className={`shrink-0 rounded-lg transition-all ${copied ? 'bg-green-600 hover:bg-green-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}`}
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>
                            {copied && <p className="text-green-600 text-xs font-medium">✓ Código copiado!</p>}
                        </div>

                        {/* Status */}
                        <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 flex items-center gap-3">
                            <Loader2 className="w-5 h-5 text-blue-500 animate-spin shrink-0" />
                            <p className="text-blue-700 text-sm">
                                Aguardando confirmação do pagamento...
                                <br />
                                <span className="text-blue-400 text-xs">O plano Pro será ativado automaticamente após o pagamento.</span>
                            </p>
                        </div>

                        <Button
                            variant="ghost"
                            onClick={() => { stopPolling(); setStep('idle'); }}
                            className="w-full text-gray-400 hover:text-gray-600 rounded-xl"
                        >
                            Cancelar e voltar
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Coleta CPF ─────────────────────────────────────────────────
    if (step === 'cpf' || step === 'loading') {
        return (
            <div className="max-w-xl mx-auto px-4 py-10">
                <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-6 flex flex-col items-center text-white text-center">
                        <QrCode className="w-12 h-12 mb-3" />
                        <h1 className="text-xl font-extrabold">Gerar QR Code PIX</h1>
                        <p className="text-blue-200 text-sm mt-1">Informe seu CPF para emitir a cobrança</p>
                    </div>
                    <div className="bg-white p-8 space-y-5">
                        <p className="text-gray-500 text-sm">
                            O PagBank exige o CPF do pagador para emitir cobranças Pix. Seus dados são tratados com segurança.
                        </p>
                        <div className="space-y-2">
                            <Label htmlFor="cpf-page" className="text-gray-600 text-sm">CPF do pagador</Label>
                            <Input
                                id="cpf-page"
                                placeholder="000.000.000-00"
                                value={cpf}
                                onChange={(e) => setCpf(e.target.value)}
                                maxLength={14}
                                disabled={step === 'loading'}
                                className="text-gray-800"
                            />
                        </div>
                        <Button
                            onClick={handleCreatePix}
                            disabled={step === 'loading'}
                            className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg"
                        >
                            {step === 'loading'
                                ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Gerando PIX...</>
                                : <><QrCode className="w-4 h-4 mr-2" /> Gerar QR Code PIX</>
                            }
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => setStep('idle')}
                            className="w-full text-gray-400 hover:text-gray-600 rounded-xl"
                        >
                            Voltar
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // ── PLANO FREE (call to action) ───────────────────────────────
    return (
        <div className="max-w-xl mx-auto px-4 py-10">
            <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200">
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

                <div className="bg-white p-8">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">O que você libera com o PRO</h2>
                    <ul className="space-y-3 mb-6">
                        {['Vendas ilimitadas', 'Sem bloqueio ao crescer', 'Controle completo do negócio', 'Ativação automática após pagamento'].map(b => (
                            <li key={b} className="flex items-center gap-3 text-gray-700">
                                <Zap className="w-5 h-5 text-indigo-500 shrink-0" />
                                <span>{b}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="flex items-baseline justify-center gap-1 my-6">
                        <span className="text-4xl font-extrabold text-gray-900">R$ 29,99</span>
                        <span className="text-gray-400 text-sm">/mês</span>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mb-6">
                        <ShieldCheck className="w-4 h-4 text-green-500" />
                        Pagamento seguro via PagSeguro/PagBank — PIX
                    </div>

                    <div className="space-y-3">
                        <Button
                            onClick={() => setStep('cpf')}
                            className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all hover:scale-[1.02]"
                        >
                            <QrCode className="w-4 h-4 mr-2" />
                            Liberar acesso ilimitado via PIX
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
