export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

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

    const response = await fetch(`${API_URL}${endpoint}`, config);

    if (response.status === 401) {
        // Token expirado ou inválido
        localStorage.removeItem('auth_token');
        // Opcional: Redirecionar para login via window.location ou evento
        // window.location.href = '/login'; 
        // Melhor não forçar reload aqui para não quebrar SPA, deixar quem chamou lidar ou usar evento.
    }

    // Tratamento de resposta vazia (204 No Content)
    if (response.status === 204) {
        return null;
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const error = new Error(data?.message || 'Erro na requisição');
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
}
