import React, { useState, useEffect } from 'react';
import { handleApiError } from '@/api/errorHandler';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/lib/supabase';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loadingGoogle, setLoadingGoogle] = useState(false);

    const processingRef = React.useRef(false);

    useEffect(() => {
        const handleAuth = async (session) => {
            if (processingRef.current || !session?.access_token) return;
            processingRef.current = true;
            
            try {
                setLoadingGoogle(true);
                setError('');
                console.log('[Auth] Iniciando sincronização com backend...');
                
                const success = await base44.auth.loginWithGoogleToken(session.access_token);
                if (success) {
                    console.log('[Auth] Login validado. Redirecionando...');
                    window.location.href = '/Dashboard';
                } else {
                    setError('O servidor não emitiu uma sessão válida para este login do Google.');
                    processingRef.current = false;
                }
            } catch (err) {
                handleApiError(err, 'autenticar')
                console.error('[Auth] Erro na ponte do backend:', err);
                setError(err.message || 'Erro ao sincronizar login com Google');
                processingRef.current = false;
            } finally {
                setLoadingGoogle(false);
            }
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
                handleAuth(session);
            }
        });

        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                handleAuth(session);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleGoogleLogin = async () => {
        setLoadingGoogle(true);
        setError('');
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin + '/Login'
                }
            });
            if (error) throw error;
        } catch (err) {
            setError(err.message || 'Erro ao abrir login com Google');
            setLoadingGoogle(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const success = await base44.auth.login(email, password);
            if (success) {
                window.location.href = '/Dashboard';
            } else {
                setError('Falha no login');
            }
        } catch (err) {
            setError('Erro ao conectar');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-md border border-slate-200">
                <h1 className="text-3xl font-black mb-8 text-center text-slate-900 tracking-tight italic">LUCRO CERTO</h1>

                {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-sm font-bold border border-red-100">{error}</div>}

                <button 
                    onClick={handleGoogleLogin} 
                    disabled={loadingGoogle}
                    className="w-full bg-white border-2 border-slate-100 text-slate-700 h-14 rounded-2xl hover:bg-slate-50 flex items-center justify-center gap-3 mb-6 transition-all font-bold"
                >
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                    {loadingGoogle ? 'Autenticando...' : 'Entrar com Google'}
                </button>

                <div className="flex items-center my-6">
                    <div className="flex-1 border-t-2 border-slate-50"></div>
                    <span className="px-4 text-xs font-black text-slate-300 uppercase italic">ou</span>
                    <div className="flex-1 border-t-2 border-slate-50"></div>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <input
                            type="email"
                            className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 font-bold text-slate-900 focus:ring-2 focus:ring-green-500 transition-all"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="Email"
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 font-bold text-slate-900 focus:ring-2 focus:ring-green-500 transition-all"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Senha"
                        />
                    </div>
                    <button className="w-full h-14 bg-green-600 text-white font-black text-lg rounded-2xl hover:bg-green-700 shadow-lg shadow-green-200 transition-all uppercase italic">
                        Entrar
                    </button>
                </form>

                <div className="mt-8 text-center pt-6 border-t border-slate-50">
                    <a href="/Register" className="text-green-600 font-black text-sm hover:underline uppercase italic">
                        Criar Conta Grátis
                    </a>
                </div>
            </div>
        </div>
    );
}
