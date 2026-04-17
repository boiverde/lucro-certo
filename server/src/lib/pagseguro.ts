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
        'Content-Type': 'application/json;charset=ISO-8859-1'
        // Removido Accept global json para não engessar
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
    const params = new URLSearchParams();
    params.append('currency', 'BRL');
    params.append('itemId1', 'plan_pro_01');
    params.append('itemDescription1', data.description);
    params.append('itemAmount1', data.amount.toFixed(2));
    params.append('itemQuantity1', '1');
    params.append('reference', data.reference);
    params.append('senderName', data.userName.trim().substring(0, 50));
    params.append('senderEmail', data.userEmail);
    params.append('shippingAddressRequired', 'false');
    
    if (data.notificationUrl) {
        params.append('notificationURL', data.notificationUrl);
    }
    
    const redirectURL = `${process.env.FRONTEND_URL}/Dashboard?payment=success`;
    params.append('redirectURL', redirectURL);

    try {
        console.log("=== PAGSEGURO DIAGOSTICO START ===");
        console.log("PAGSEGURO REQUEST PAYLOAD:", params.toString());
        
        const response = await pagseguroClient.post('/v2/checkout', params.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=ISO-8859-1',
                'Accept': 'application/xml;charset=ISO-8859-1'
            }
        });
        
        console.log("PAGSEGURO SUCCESS RESPONSE RAW:", response.data);
        
        const { XMLParser } = require('fast-xml-parser');
        const parser = new XMLParser();
        const parsed = parser.parse(response.data);
        
        console.log("PAGSEGURO PARSED XML:", JSON.stringify(parsed, null, 2));
        console.log("=== PAGSEGURO DIAGOSTICO END ===");
        
        // O PagSeguro retorna o code do checkout para montar a URL
        return { code: parsed?.checkout?.code, ...parsed?.checkout };
    } catch (error: any) {
        console.error("=== PAGSEGURO ERROR START ===");
        console.error("PAGSEGURO ERROR MESSAGE:", error.message);
        if (error.response) {
            console.error("PAGSEGURO ERROR DATA:", JSON.stringify(error.response.data, null, 2));
            console.error("PAGSEGURO ERROR STATUS:", error.response.status);
        } else {
            console.error("PAGSEGURO FULL ERROR OBJ:", error);
        }
        console.error("=== PAGSEGURO ERROR END ===");
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
