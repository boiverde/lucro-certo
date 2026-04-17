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
        // Métricas do Funil de Conversão
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

        // Conversão por Origem
        const origins = await prisma.analyticsEvent.groupBy({
            where: { event: 'upgrade_view' },
            by: ['origin'],
            _count: { id: true }
        })

        return { stats, conversion, origins, recovered }
    })
}
