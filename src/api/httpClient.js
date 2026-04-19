export const API_URL = import.meta.env.VITE_API_URL || 'https://lucro-certolucro-certo-api.onrender.com';
import { handleApiError } from './errorHandler';

export async function httpClient(endpoint, options = {}) {
    const token = localStorage.getItem('auth_token');

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers,
    };

    // Hardening: Adicionar timeout de 15 segundos para evitar spinners infinitos
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 15000);
    config.signal = controller.signal;

    let response;
    try {
        response = await fetch(`${API_URL}${endpoint}`, config);
        clearTimeout(id);
    } catch (e) {
        clearTimeout(id);
        const error = e.name === 'AbortError' 
            ? new Error('O servidor está demorando muito a responder. Tente novamente.')
            : new Error('Não foi possível conectar ao servidor. Verifique sua rede.');
        
        handleApiError(error, 'conectar ao servidor');
        error.handledGlobally = true;
        throw error;
    }

    // Tratamento de resposta vazia (204 No Content)
    if (response.status === 204) {
        return null;
    }

    const data = await response.json().catch(() => null);

    if (response.status === 401) {
        // Token expirado ou inválido
        localStorage.removeItem('auth_token');
    }

    // Interceptar erro de limite atingido (Plano Free)
    if (response.status === 403 && data?.error === 'LIMIT_REACHED') {
        window.dispatchEvent(new CustomEvent('open-upgrade-modal'));
    }

    if (!response.ok) {
        const error = new Error(data?.message || 'Erro na requisição');
        error.status = response.status;
        error.data = data;
        
        // Atravessamos o manipulador de erros global para garantir toasts não genéricos e consistentes
        if (!error.handledGlobally) {
            handleApiError(error, 'processar ação');
            error.handledGlobally = true;
        }

        throw error;
    }

    return data;
}
