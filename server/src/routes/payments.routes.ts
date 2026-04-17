import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { createCheckoutRequest, getTransactionStatus } from '../lib/pagseguro'

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
}
