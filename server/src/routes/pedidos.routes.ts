import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function pedidosRoutes(app: FastifyInstance) {
    app.addHook('onRequest', (app as any).authenticate)

    // Listar Pedidos
    app.withTypeProvider<ZodTypeProvider>().get('/', {
        schema: {
            querystring: z.object({
                status: z.string().optional(),
            }),
        },
    }, async (request) => {
        const { status } = request.query
        const userId = (request.user as any).sub

        const where: any = { userId }
        if (status) where.status = status

        const pedidos = await prisma.pedido.findMany({
            where,
            orderBy: { data_pedido: 'desc' },
        })

        return { results: pedidos }
    })

    // Adicionar Pedido
    app.withTypeProvider<ZodTypeProvider>().post('/', {
        schema: {
            body: z.object({
                cliente_nome: z.string().optional(),
                status: z.string().default('pendente'),
                valor_total: z.number(),
                data_pedido: z.string().datetime().or(z.string()).optional(),
            }),
        },
    }, async (request, reply) => {
        const userId = (request.user as any).sub
        const data = request.body

        const pedido = await prisma.pedido.create({
            data: {
                userId,
                cliente_nome: data.cliente_nome,
                status: data.status,
                valor_total: data.valor_total,
                data_pedido: data.data_pedido ? new Date(data.data_pedido) : undefined,
            }
        })

        return reply.status(201).send(pedido)
    })

    // Atualizar Pedido
    app.withTypeProvider<ZodTypeProvider>().put('/:id', {
        schema: {
            params: z.object({ id: z.string().uuid() }),
            body: z.object({
                cliente_nome: z.string().optional(),
                status: z.string().optional(),
                valor_total: z.number().optional(),
            }),
        }
    }, async (request, reply) => {
        const { id } = request.params
        const userId = (request.user as any).sub
        const data = request.body

        const pedido = await prisma.pedido.updateMany({
            where: { id, userId },
            data
        })

        if (pedido.count === 0) return reply.status(404).send()
        return reply.status(200).send()
    })

    // Deletar
    app.withTypeProvider<ZodTypeProvider>().delete('/:id', {
        schema: { params: z.object({ id: z.string().uuid() }) }
    }, async (request, reply) => {
        const { id } = request.params
        const userId = (request.user as any).sub

        await prisma.pedido.deleteMany({ where: { id, userId } })
        return reply.status(204).send()
    })
}
