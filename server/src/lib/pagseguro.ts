import axios from 'axios';

const PAGSEGURO_EMAIL = process.env.PAGSEGURO_EMAIL;
const PAGSEGURO_TOKEN = process.env.PAGSEGURO_TOKEN;
const PAGSEGURO_BASE_URL = process.env.PAGSEGURO_BASE_URL;

export const pagseguroClient = axios.create({
    baseURL: PAGSEGURO_BASE_URL,
    params: {
        email: PAGSEGURO_EMAIL,
        token: PAGSEGURO_TOKEN,
    },
    headers: {
        'Content-Type': 'application/json;charset=ISO-8859-1',
        'Accept': 'application/json;charset=ISO-8859-1'
    }
});

/**
 * Cria uma requisição de checkout (Link de Pagamento)
 * Utiliza a API de Checkout v2 (com suporte a JSON v3 via headers)
 */
export async function createCheckoutRequest(data: {
    reference: string;
    description: string;
    amount: number;
    userName: string;
    userEmail: string;
    notificationUrl: string;
}) {
    const body = {
        currency: 'BRL',
        items: [
            {
                id: 'plan_pro_01',
                description: data.description,
                amount: data.amount.toFixed(2),
                quantity: 1
            }
        ],
        reference: data.reference,
        sender: {
            name: data.userName.trim().substring(0, 50),
            email: data.userEmail
        },
        shipping: {
            addressRequired: false
        },
        notificationURL: data.notificationUrl,
        redirectURL: `${process.env.FRONTEND_URL}/Dashboard?payment=success`
    };

    try {
        const response = await pagseguroClient.post('/v2/checkout', body);
        // O PagSeguro retorna o code do checkout para montar a URL
        return response.data.checkout || response.data;
    } catch (error: any) {
        console.error('[PAGSEGURO LIB ERROR]', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Consulta status de uma transação por código de notificação
 */
export async function getTransactionStatus(notificationCode: string) {
    try {
        const response = await pagseguroClient.get(`/v3/transactions/notifications/${notificationCode}`);
        return response.data.transaction || response.data;
    } catch (error: any) {
        console.error('[PAGSEGURO CONSULT ERROR]', error.response?.data || error.message);
        throw error;
    }
}
