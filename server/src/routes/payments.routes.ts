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

        const baseUrl = process.env.PAGSEGURO_BASE_URL?.includes('sandbox')
            ? 'https://sandbox.pagseguro.uol.com.br/v2/checkout/payment.html'
            : 'https://pagseguro.uol.com.br/v2/checkout/payment.html';
        
        const checkoutUrl = `${baseUrl}?code=${checkout.code}`;
        return { checkoutUrl, code: checkout.code };
    })

    // 2. Webhook / Retorno de Notificação do PagSeguro (Legado v2)
    app.post('/pagseguro/webhook', async (request, reply) => {
        // O PagSeguro v2 envia um notificationCode. Nós consultamos o servidor DELES.
        // Isso já é inerentemente seguro, pois o code só o PagSeguro sabe.
        const { notificationCode, notificationType } = request.body as any;

        if (notificationType === 'transaction') {
            const transactionData = await getTransactionStatus(notificationCode);
            const status = Number(transactionData.status);
            const reference = transactionData.reference;

            if (reference && reference.startsWith('upgrade_pro_')) {
                const localTransaction = await prisma.transaction.findUnique({
                    where: { externalReference: reference }
                });

                if (localTransaction && localTransaction.status !== 'approved') {
                    const isPaid = (status === 3 || status === 4);

                    if (isPaid) {
                        await prisma.$transaction(async (tx) => {
                            await tx.transaction.update({
                                where: { id: localTransaction.id },
                                data: { status: 'approved', externalId: transactionData.code }
                            })

                            // Lógica de Renovação Preditiva (Acumula dias se já for PRO)
                            const user = await tx.user.findUnique({ where: { id: localTransaction.userId }, select: { planExpiresAt: true } })
                            const baseDate = (user?.planExpiresAt && new Date(user.planExpiresAt) > new Date()) 
                                ? new Date(user.planExpiresAt) 
                                : new Date()
                            
                            const expiresAt = new Date(baseDate)
                            expiresAt.setDate(expiresAt.getDate() + 30)

                            await tx.user.update({
                                where: { id: localTransaction.userId },
                                data: { plan: 'pro', planExpiresAt: expiresAt }
                            })
                        })
                    } else {
                        await prisma.transaction.update({
                            where: { id: localTransaction.id },
                            data: { status: status.toString(), externalId: transactionData.code }
                        })
                    }
                }
            }
        }
        return reply.status(200).send();
    })

    // 3. Verificar status atual do plano
    app.withTypeProvider<ZodTypeProvider>().get('/plan-status', {
        onRequest: [app.authenticate as any]
    }, async (request, reply) => {
        const userId = (request.user as any).sub
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { plan: true, planExpiresAt: true }
        })
        if (!user) return reply.status(404).send({ message: 'Usuário não encontrado' })
        return { plan: user.plan, planExpiresAt: user.planExpiresAt }
    })

    // 4. Criar cobrança Pix
    app.withTypeProvider<ZodTypeProvider>().post('/pix', {
        onRequest: [app.authenticate as any],
        schema: {
            body: z.object({ 
                cpf: z.string().min(11).max(14),
                planId: z.enum(['pro_monthly', 'pro_yearly']).default('pro_monthly')
            })
        }
    }, async (request, reply) => {
        const userId = (request.user as any).sub
        const { cpf, planId } = request.body

        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (!user) return reply.status(401).send({ message: 'Acesso negado' })

        const referenceId = `pix_pro_${userId}_${Date.now()}`
        const amountCents = planId === 'pro_yearly' ? 24900 : 2999 // R$ 249,00 ou R$ 29,99

        try {
            const pix = await createPixCharge({
                referenceId,
                customerName: user.name,
                customerEmail: user.email,
                customerTaxId: cpf,
                amountCents,
                notificationUrl: process.env.PAGSEGURO_NOTIFICATION_URL || ''
            })

            await prisma.transaction.create({
                data: {
                    userId,
                    amount: amountCents / 100,
                    status: 'pending',
                    externalReference: referenceId,
                    externalId: pix.orderId,
                    provider: 'pagseguro_pix',
                    planId: planId
                }
            })

            return reply.send({
                orderId: pix.orderId,
                qrCodeBase64: pix.qrCodeBase64,
                qrCodeText: pix.qrCodeText,
                expiresAt: pix.expiresAt,
                planId: planId
            })
        } catch (err: any) {
            return reply.status(500).send({ message: 'Erro ao criar Pix' })
        }
    })

    // 5. Webhook Pix - Idempotente, Atômico e VALIDADO
    app.post('/pix/webhook', async (request, reply) => {
        // Hardening: Validar se a requisição tem o Token de Autorização esperado
        // O PagBank envia o token que você configurou no dashboard de notificações.
        const authHeader = request.headers.authorization
        const expectedToken = process.env.PAGSEGURO_TOKEN // Usando o mesmo token da API para simplificar se o usuário configurou assim

        if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
            console.warn('[PIX-WEBHOOK-SECURITY] Unauthorized notification attempt rejected.')
            return reply.status(401).send({ message: 'Unauthorized' })
        }

        try {
            const body = request.body as any
            const orderId = body?.id
            const charges = body?.charges || []
            const isPaid = charges.some((c: any) => c.status === 'PAID')

            if (orderId && isPaid) {
                const transaction = await prisma.transaction.findUnique({
                    where: { externalId: orderId }
                })

                if (transaction && transaction.status !== 'approved') {
                    await prisma.$transaction(async (tx) => {
                        await tx.transaction.update({
                            where: { id: transaction.id },
                            data: { status: 'approved' }
                        })

                        // Lógica de Renovação Acumulativa
                        const user = await tx.user.findUnique({ where: { id: transaction.userId }, select: { planExpiresAt: true } })
                        const baseDate = (user?.planExpiresAt && new Date(user.planExpiresAt) > new Date())
                            ? new Date(user.planExpiresAt)
                            : new Date()

                        const expiresAt = new Date(baseDate)
                        const days = transaction.planId === 'pro_yearly' ? 365 : 30
                        expiresAt.setDate(expiresAt.getDate() + days)

                        await tx.user.update({
                            where: { id: transaction.userId },
                            data: { 
                                plan: 'pro', 
                                planType: transaction.planId === 'pro_yearly' ? 'yearly' : 'monthly',
                                planExpiresAt: expiresAt 
                            }
                        })
                    })
                    console.log(`[PIX-WEBHOOK] Upgrade Successful (Hardened) | plan: ${transaction.planId}`)
                }
            }
        } catch (err: any) {
            console.error('[PIX-WEBHOOK-ERROR]', err.message)
        }
        return reply.status(200).send()
    })

    // 6. Polling Pix - Idempotente e Atômico com Suporte Anual
    app.withTypeProvider<ZodTypeProvider>().get('/pix/status/:orderId', {
        onRequest: [app.authenticate as any]
    }, async (request, reply) => {
        const { orderId } = request.params as { orderId: string }
        const userId = (request.user as any).sub

        const user = await prisma.user.findUnique({ where: { id: userId }, select: { plan: true } })
        if (user?.plan === 'pro') return reply.send({ status: 'PAID' })

        try {
            const response = await pagbankClient.get(`/orders/${orderId}`)
            const isPaid = response.data?.charges?.some((c: any) => c.status === 'PAID')

            if (isPaid) {
                const transaction = await prisma.transaction.findUnique({ where: { externalId: orderId } })
                if (transaction && transaction.status !== 'approved') {
                    await prisma.$transaction(async (tx) => {
                        await tx.transaction.update({ where: { id: transaction.id }, data: { status: 'approved' } })
                        
                        const expiresAt = new Date()
                        const days = transaction.planId === 'pro_yearly' ? 365 : 30
                        expiresAt.setDate(expiresAt.getDate() + days)

                        await tx.user.update({ 
                            where: { id: userId }, 
                            data: { 
                                plan: 'pro', 
                                planType: transaction.planId === 'pro_yearly' ? 'yearly' : 'monthly',
                                planExpiresAt: expiresAt 
                            } 
                        })
                    })
                }
                return reply.send({ status: 'PAID' })
            }
            return reply.send({ status: 'PENDING' })
        } catch (err: any) {
            return reply.send({ status: 'UNKNOWN' })
        }
    })
}
