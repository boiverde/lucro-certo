import React, { useState, useEffect } from 'react';
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
                console.error('[Auth] Erro na ponte do backend:', err);
                setError(err.message || 'Erro ao sincronizar login com Google');
                processingRef.current = false;
            } finally {
                setLoadingGoogle(false);
            }
        };

        // Escuta mudanças de estado (Callbacks de Redirect caem aqui)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('[Auth] Evento Supabase:', event);
            if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
                handleAuth(session);
            }
        });

        // Verificação imediata (Fallback)
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                console.log('[Auth] Sessão encontrada no carregamento inicial');
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
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center">Acessar Sistema</h1>

                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

                <button 
                    onClick={handleGoogleLogin} 
                    disabled={loadingGoogle}
                    className="w-full bg-white border border-gray-300 text-gray-700 p-2 rounded hover:bg-gray-50 flex items-center justify-center gap-2 mb-4 transition-colors"
                >
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                    {loadingGoogle ? 'Autenticando...' : 'Entrar com Google'}
                </button>

                <div className="flex items-center my-4">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <span className="px-3 text-sm text-gray-500">ou</span>
                    <div className="flex-1 border-t border-gray-300"></div>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label className="block mb-2">Email</label>
                        <input
                            type="email"
                            className="w-full border p-2 rounded"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="admin@lucrocerto.com"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block mb-2">Senha</label>
                        <input
                            type="password"
                            className="w-full border p-2 rounded"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="admin"
                        />
                    </div>
                    <button className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
                        Entrar
                    </button>
                </form>
                <div className="mt-4 text-center text-sm text-gray-500">
                    Use: admin@lucrocerto.com / admin
                </div>
            </div>
        </div>
    );
}
