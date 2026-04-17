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

    // Listar eventos (apenas para admin simulado ou auditoria)
    app.get('/events', async (request) => {
        const events = await prisma.analyticsEvent.findMany({
            orderBy: { timestamp: 'desc' },
            take: 100,
            include: { user: { select: { name: true, email: true } } }
        })
        return events
    })
}
