import { httpClient } from './httpClient';

export const auth = {
    // Login direto (Email/Senha) - Novo
    login: async (email, password) => {
        const data = await httpClient('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        if (data.token) {
            localStorage.setItem('auth_token', data.token);
            return true;
        }
        return false;
    },

    // Cadastro (Novo backend)
    register: async (name, email, password) => {
        return httpClient('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password }),
        });
    },

    // Perfil do usuário logado
    me: async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) throw new Error('Not authenticated');

        return httpClient('/auth/me');
    },

    // Logout
    logout: async () => {
        localStorage.removeItem('auth_token');
        // window.location.href = '/login'; // Opcional
    },

    // Compatibilidade com código antigo que chamava loginWithRedirect
    loginWithRedirect: async (redirectUrl) => {
        console.log('Redirecionando para login local...');
        window.location.href = '/login';
    }
};
