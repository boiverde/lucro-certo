export const API_URL = import.meta.env.VITE_API_URL || 'https://lucro-certolucro-certo-api.onrender.com';

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
        // Token expirado ou invÃ¡lido
        localStorage.removeItem('auth_token');
        // Opcional: Redirecionar para login via window.location ou evento
        // window.location.href = '/login'; 
        // Melhor nÃ£o forÃ§ar reload aqui para nÃ£o quebrar SPA, deixar quem chamou lidar ou usar evento.
    }

    // Tratamento de resposta vazia (204 No Content)
    if (response.status === 204) {
        return null;
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const error = new Error(data?.message || 'Erro na requisiÃ§Ã£o');
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
}
