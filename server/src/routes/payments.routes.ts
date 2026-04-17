import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { createCheckoutRequest, getTransactionStatus } from '../lib/pagseguro'
import { createPixCharge, pagbankClient } from '../lib/pagseguro-pix'

export async function paymentsRoutes(app: FastifyInstance) {
    // 1. Iniciar checkout PagSeguro para upgrade Plano Pro
    app.withTypeProvider<ZodTypeProvider>().post('/upgrade', {
        onRequest: [app.authenticate as any]
    }, async (request, reply) => {
        const userId = (request.user as any).sub

        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (!user) return reply.status(401).send({ message: 'Acesso negado' })

        if (user.plan === 'pro') {
            return reply.status(400).send({ message: 'Você já possui o plano Pro' })
        }

        const externalReference = `upgrade_pro_${userId}_${Date.now()}`
        const amount = 29.99;

        const checkout = await createCheckoutRequest({
            reference: externalReference,
            description: 'Lucro Certo - Plano Pro (Acesso Ilimitado)',
            amount: amount,
            userName: user.name,
            userEmail: user.email,
            notificationUrl: process.env.PAGSEGURO_NOTIFICATION_URL || ''
        });

        // Registrar intenção no banco
        await prisma.transaction.create({
            data: {
                userId,
                amount: amount,
                status: 'pending',
                externalReference: externalReference,
                provider: 'pagseguro'
            }
        });

        // Gerar URL de Checkout Real
        const baseUrl = process.env.PAGSEGURO_BASE_URL?.includes('sandbox')
            ? 'https://sandbox.pagseguro.uol.com.br/v2/checkout/payment.html'
            : 'https://pagseguro.uol.com.br/v2/checkout/payment.html';
        
        const checkoutUrl = `${baseUrl}?code=${checkout.code}`;

        return { checkoutUrl, code: checkout.code };
    })

    // 2. Webhook / Retorno de Notificação do PagSeguro
    // Aceita requisições form-urlencoded via fastify-formbody
    app.post('/pagseguro/webhook', async (request, reply) => {
        const { notificationCode, notificationType } = request.body as any;

        if (notificationType === 'transaction') {
            // Consultar detalhes da transação no PagSeguro para validar segurança
            const transactionData = await getTransactionStatus(notificationCode);
            
            // Status PagSeguro: 3 = Pago, 4 = Disponível (ambos indicam sucesso na cobrança)
            const status = Number(transactionData.status);
            const reference = transactionData.reference;

            if (reference && reference.startsWith('upgrade_pro_')) {
                const localTransaction = await prisma.transaction.findUnique({
                    where: { externalReference: reference }
                });

                if (localTransaction && localTransaction.status !== 'approved') {
                    const isPaid = (status === 3 || status === 4);

                    // Atualizar status da transação
                    await prisma.transaction.update({
                        where: { id: localTransaction.id },
                        data: {
                            status: isPaid ? 'approved' : status.toString(),
                            externalId: transactionData.code // O 'code' aqui é o ID real da transação no PS
                        }
                    });

                    // Ativar plano se for pago
                    if (isPaid) {
                        await prisma.user.update({
                            where: { id: localTransaction.userId },
                            data: { plan: 'pro' }
                        });
                        console.log(`[SUBSCRIPTION-PAGSEGURO] Plan upgraded to PRO automatically | User: ${localTransaction.userId} | MP ID: ${transactionData.code}`);
                    }
                }
            }
        }

        // PagSeguro não espera corpo na resposta, apenas status 200
        return reply.status(200).send();
    })

    // 3. Verificar status atual do plano (usado pelo frontend após retorno do checkout)
    app.withTypeProvider<ZodTypeProvider>().get('/plan-status', {
        onRequest: [app.authenticate as any]
    }, async (request, reply) => {
        const userId = (request.user as any).sub
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { plan: true }
        })
        if (!user) return reply.status(404).send({ message: 'Usuário não encontrado' })
        return { plan: user.plan }
    })

    // =========================================================
    // PIX — Nova integração via PagBank API v4 (JSON/Bearer)
    // =========================================================

    // 4. Criar cobrança Pix para upgrade Plano Pro
    app.withTypeProvider<ZodTypeProvider>().post('/pix', {
        onRequest: [app.authenticate as any],
        schema: {
            body: z.object({
                // CPF do comprador — obrigatório pela PagBank API v4
                cpf: z.string().min(11).max(14)
            })
        }
    }, async (request, reply) => {
        const userId = (request.user as any).sub
        const { cpf } = request.body as { cpf: string }

        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (!user) return reply.status(401).send({ message: 'Acesso negado' })

        if (user.plan === 'pro') {
            return reply.status(400).send({ message: 'Você já possui o plano Pro' })
        }

        const referenceId = `pix_pro_${userId}_${Date.now()}`
        const amountCents = 2999 // R$ 29,99

        try {
            const pix = await createPixCharge({
                referenceId,
                customerName: user.name,
                customerEmail: user.email,
                customerTaxId: cpf,
                amountCents,
                notificationUrl: process.env.PAGSEGURO_NOTIFICATION_URL || ''
            })

            // Registrar intenção no banco
            await prisma.transaction.create({
                data: {
                    userId,
                    amount: amountCents / 100,
                    status: 'pending',
                    externalReference: referenceId,
                    externalId: pix.orderId,
                    provider: 'pagseguro_pix'
                }
            })

            return reply.send({
                orderId: pix.orderId,
                qrCodeBase64: pix.qrCodeBase64,
                qrCodeText: pix.qrCodeText,
                expiresAt: pix.expiresAt
            })
        } catch (err: any) {
            const errorData = err.response?.data;
            console.error('[PIX ROUTE ERROR]', JSON.stringify(errorData, null, 2) || err.message);

            // Tentar extrair mensagem amigável da PagSeguro
            let friendlyMessage = 'Erro ao criar cobrança Pix';
            if (errorData?.error_messages?.[0]?.description) {
                friendlyMessage = errorData.error_messages[0].description;
            }

            return reply.status(500).send({
                message: friendlyMessage,
                detail: errorData || err.message
            })
        }
    })

    // 5. Webhook Pix — notificação da PagBank API v4 (JSON)
    app.post('/pix/webhook', async (request, reply) => {
        try {
            const body = request.body as any
            console.log('[PIX WEBHOOK] Received:', JSON.stringify(body, null, 2))

            const orderId = body?.id
            const charges = body?.charges || []

            const isPaid = charges.some((c: any) => c.status === 'PAID')

            if (orderId && isPaid) {
                const transaction = await prisma.transaction.findFirst({
                    where: { externalId: orderId, provider: 'pagseguro_pix' }
                })

                if (transaction && transaction.status !== 'approved') {
                    await prisma.transaction.update({
                        where: { id: transaction.id },
                        data: { status: 'approved' }
                    })

                    await prisma.user.update({
                        where: { id: transaction.userId },
                        data: { plan: 'pro' }
                    })

                    console.log(`[PIX] Plan upgraded to PRO | userId: ${transaction.userId} | orderId: ${orderId}`)
                }
            }
        } catch (err: any) {
            console.error('[PIX WEBHOOK ERROR]', err.message)
        }

        // PagBank exige apenas status 200 na resposta do webhook
        return reply.status(200).send()
    })

    // 6. Polling de status do Pix (frontend consulta para confirmar pagamento)
    app.withTypeProvider<ZodTypeProvider>().get('/pix/status/:orderId', {
        onRequest: [app.authenticate as any]
    }, async (request, reply) => {
        const { orderId } = request.params as { orderId: string }
        const userId = (request.user as any).sub

        // Verifica se o usuário já foi promovido
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { plan: true } })
        if (user?.plan === 'pro') {
            return reply.send({ status: 'PAID', plan: 'pro' })
        }

        // Consulta a API do PagBank para status em tempo real
        try {
            const response = await pagbankClient.get(`/orders/${orderId}`)
            const charges = response.data?.qr_codes || []
            const isPaid = response.data?.charges?.some((c: any) => c.status === 'PAID')

            return reply.send({
                status: isPaid ? 'PAID' : 'PENDING',
                plan: user?.plan || 'free'
            })
        } catch (err: any) {
            console.error('[PIX STATUS ERROR]', err.response?.data || err.message)
            return reply.send({ status: 'UNKNOWN', plan: user?.plan || 'free' })
        }
    })
}
