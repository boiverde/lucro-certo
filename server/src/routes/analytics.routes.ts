import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function analyticsRoutes(app: FastifyInstance) {
    app.addHook('onRequest', app.authenticate)

    app.withTypeProvider<ZodTypeProvider>().post('/event', {
        schema: {
            body: z.object({
                event: z.string(),
                origin: z.string().optional(),
                metadata: z.any().optional(),
            }),
        },
    }, async (request, reply) => {
        const userId = request.user.sub
        const { event, origin, metadata } = request.body

        await prisma.analyticsEvent.create({
            data: {
                userId,
                event,
                origin,
                metadata: metadata || {},
            }
        })

        return reply.status(204).send()
    })

    // Métricas do Funil de Conversão
    app.get('/funnel', async (request) => {
        const events = await prisma.analyticsEvent.groupBy({
            by: ['event'],
            _count: { id: true }
        })

        const stats = {
            view: events.find(e => e.event === 'upgrade_view')?._count.id || 0,
            click: events.find(e => e.event === 'upgrade_click')?._count.id || 0,
            qrcode: events.find(e => e.event === 'pix_created')?._count.id || 0,
            paid: events.find(e => e.event === 'pix_paid')?._count.id || 0
        }

        // Recuperação de pagamentos (cliques em banners de pendente)
        const recovered = await prisma.analyticsEvent.count({
            where: { 
                event: 'upgrade_view', 
                origin: { contains: 'pagamento' } 
            }
        })

        const conversion = {
            view_to_click: stats.view > 0 ? (stats.click / stats.view * 100).toFixed(1) : 0,
            click_to_paid: stats.click > 0 ? (stats.paid / stats.click * 100).toFixed(1) : 0,
            total_conversion: stats.view > 0 ? (stats.paid / stats.view * 100).toFixed(1) : 0,
            recovery_rate: stats.qrcode > 0 ? (recovered / stats.qrcode * 100).toFixed(1) : 0
        }

        // Receita por Visualização (RPV)
        const totalRevenue = await prisma.transaction.aggregate({
            where: { status: 'approved' },
            _sum: { amount: true }
        })

        const rpv = stats.view > 0 ? (Number(totalRevenue._sum.amount || 0) / stats.view).toFixed(2) : 0

        // Métricas por Variante A/B
        const abStats = await prisma.analyticsEvent.groupBy({
            where: { event: 'upgrade_view' },
            by: ['metadata'],
            _count: { id: true }
        })

        const abResults = {
            variant_A: abStats.find(s => (s.metadata as any)?.ab_variant === 'A')?._count.id || 0,
            variant_B: abStats.find(s => (s.metadata as any)?.ab_variant === 'B')?._count.id || 0
        }

        // Conversão por Tipo de Plano (Anual vs Mensal)
        const planTypes = await prisma.analyticsEvent.groupBy({
            where: { event: 'pix_paid' },
            by: ['metadata'],
            _count: { id: true }
        })

        const planStats = { monthly: 0, yearly: 0 }
        planTypes.forEach(p => {
            const planId = (p.metadata as any)?.planId
            if (planId === 'pro_yearly') planStats.yearly += p._count.id
            else if (planId === 'pro_monthly') planStats.monthly += p._count.id
        })

        // Critérios de Validade do Teste A/B (Confiança)
        const firstABEvent = await prisma.analyticsEvent.findFirst({
            where: { metadata: { path: ['ab_variant'], not: null } },
            orderBy: { timestamp: 'asc' }
        })
        
        const testDays = firstABEvent 
            ? Math.ceil((new Date().getTime() - firstABEvent.timestamp.getTime()) / (1000 * 60 * 60 * 24))
            : 0

        const ab_validity = {
            is_valid: stats.paid >= 200 || testDays >= 7,
            days_active: testDays,
            total_payments: stats.paid
        }

        // Conversão por Segmento de Usuário
        const segmentStats = await prisma.analyticsEvent.groupBy({
            where: { event: 'upgrade_view' },
            by: ['metadata'],
            _count: { id: true }
        })

        const segments = {
            high: segmentStats.find(s => (s.metadata as any)?.user_segment === 'high_potential')?._count.id || 0,
            medium: segmentStats.find(s => (s.metadata as any)?.user_segment === 'medium_potential')?._count.id || 0,
            low: segmentStats.find(s => (s.metadata as any)?.user_segment === 'low_potential')?._count.id || 0
        }

        return { 
            stats, 
            conversion, 
            origins, 
            recovered, 
            planStats, 
            rpv, 
            annualRate,
            abResults,
            ab_validity,
            segments
        }
    })
}
