import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { z } from 'zod';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            // Captura UTMs da URL
            const params = new URLSearchParams(window.location.search);
            const utms = {
                utm_source: params.get('utm_source') || 'organic',
                utm_medium: params.get('utm_medium') || 'direct',
                utm_campaign: params.get('utm_campaign') || 'none'
            };

            const schema = z.object({
                name: z.string().min(3),
                email: z.string().email(),
                password: z.string().min(6),
                utm_source: z.string().optional(),
                utm_medium: z.string().optional(),
                utm_campaign: z.string().optional(),
            });

            const validatedData = schema.parse({
                name,
                email,
                password,
                ...utms
            });

            const success = await base44.auth.register(validatedData);

            if (success) {
                toast.success('Conta criada com sucesso! Faça login.');
                window.location.href = '/Login';
            } else {
                toast.error('Erro ao criar conta. Verifique os dados.');
            }
        } catch (err) {
            toast.error(err.message || 'Erro ao conectar ao servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-md border border-slate-200">
                <h1 className="text-3xl font-black mb-2 text-center text-slate-900 tracking-tight italic">CRIAR CONTA</h1>
                <p className="text-center text-slate-400 text-xs font-bold uppercase mb-8 italic">Comece a lucrar agora</p>

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            required
                            className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 font-bold text-slate-900 focus:ring-2 focus:ring-green-500 transition-all"
                            value={name}
                            onChange={e => setName(String(e.target.value))}
                            placeholder="Nome Completo"
                        />
                    </div>
                    <div>
                        <input
                            type="email"
                            required
                            className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 font-bold text-slate-900 focus:ring-2 focus:ring-green-500 transition-all"
                            value={email}
                            onChange={e => setEmail(String(e.target.value))}
                            placeholder="Melhor E-mail"
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            required
                            className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 font-bold text-slate-900 focus:ring-2 focus:ring-green-500 transition-all"
                            value={password}
                            onChange={e => setPassword(String(e.target.value))}
                            placeholder="Senha (mínimo 6 caracteres)"
                        />
                    </div>
                    <button 
                        disabled={loading}
                        className="w-full h-16 bg-green-600 text-white font-black text-xl rounded-2xl hover:bg-green-700 shadow-lg shadow-green-200 transition-all uppercase italic flex items-center justify-center"
                    >
                        {loading ? 'Criando...' : 'Criar Minha Conta'}
                    </button>
                </form>

                <div className="mt-8 text-center pt-6 border-t border-slate-50">
                    <a href="/Login" className="text-slate-400 font-black text-xs hover:text-slate-600 uppercase italic">
                        Já tem uma conta? <span className="text-green-600">Entrar</span>
                    </a>
                </div>
            </div>
        </div>
    );
}
