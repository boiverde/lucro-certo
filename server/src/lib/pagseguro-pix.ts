import axios from 'axios';
import QRCode from 'qrcode';

/**
 * Cliente PagSeguro API v4 (moderna, JSON, Bearer Token)
 * Usada exclusivamente para Pix QR Code via /orders
 * Diferente do cliente legado v2 (urlencoded/xml) usado para Checkout
 */
const PAGSEGURO_TOKEN = process.env.PAGSEGURO_TOKEN;
const IS_SANDBOX = process.env.PAGSEGURO_BASE_URL?.includes('sandbox');

const PAGBANK_API_URL = IS_SANDBOX
    ? 'https://sandbox.api.pagseguro.com'
    : 'https://api.pagseguro.com';

export const pagbankClient = axios.create({
    baseURL: PAGBANK_API_URL,
    headers: {
        'Authorization': `Bearer ${PAGSEGURO_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-api-version': '4.0'
    }
});

export interface PixChargeInput {
    referenceId: string;
    customerName: string;
    customerEmail: string;
    customerTaxId: string; // CPF do comprador (obrigatório pela API)
    amountCents: number;   // Em centavos (ex: 2999 = R$29,99)
    notificationUrl: string;
    expirationDate?: string; // ISO 8601, default: 24h
}

export interface PixChargeResult {
    orderId: string;
    qrCodeBase64: string;  // Imagem PNG em base64
    qrCodeText: string;    // Código copia-e-cola
    expiresAt: string;
}

/**
 * Cria uma cobrança Pix via API PagBank v4
 * Não usa o cliente legado v2 (que usa xml/urlencoded)
 */
export async function createPixCharge(data: PixChargeInput): Promise<PixChargeResult> {
    // Validade padrão: 30 minutos
    const expiresAt = data.expirationDate || (() => {
        const d = new Date();
        d.setMinutes(d.getMinutes() + 30);
        return d.toISOString().replace('Z', '-03:00');
    })();

    const payload = {
        reference_id: data.referenceId,
        customer: {
            name: data.customerName.trim().substring(0, 50),
            email: data.customerEmail,
            tax_id: data.customerTaxId.replace(/\D/g, ''), // Remove formatação CPF
        },
        items: [
            {
                reference_id: 'PLAN_PRO_01',
                name: 'Lucro Certo - Plano Pro (Acesso Ilimitado)',
                quantity: 1,
                unit_amount: data.amountCents
            }
        ],
        qr_codes: [
            {
                amount: {
                    value: data.amountCents
                },
                expiration_date: expiresAt
            }
        ],
        notification_urls: [data.notificationUrl]
    };

    console.log('[PIX] Creating charge | referenceId:', data.referenceId, '| amount:', data.amountCents);

    const response = await pagbankClient.post('/orders', payload);

    console.log('[PIX] Charge created | orderId:', response.data?.id, '| status:', response.status);

    const qrCode = response.data?.qr_codes?.[0];

    if (!qrCode) {
        throw new Error('[PIX] QR Code não retornado pela API. Resposta: ' + JSON.stringify(response.data));
    }

    const qrCodeText = qrCode.text;
    const base64Image = await QRCode.toDataURL(qrCodeText);

    return {
        orderId: response.data.id,
        qrCodeBase64: base64Image,
        qrCodeText: qrCodeText,
        expiresAt: qrCode.expiration_date || expiresAt
    };
}
