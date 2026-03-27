import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

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
                <h1 className="text-2xl font-bold mb-6 text-center">Login Local</h1>

                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

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
