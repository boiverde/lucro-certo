import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function alertasRoutes(app: FastifyInstance) {
    app.addHook('onRequest', app.authenticate)

    // Listar Alertas
    app.withTypeProvider<ZodTypeProvider>().get('/', {
        schema: {
            // Opcional: filtro por resolvido
        },
    }, async (request) => {
        const userId = request.user.sub

        const alertas = await prisma.alertaEstoque.findMany({
            where: { userId, resolvido: false },
            include: { produto: true, ingrediente: true },
            orderBy: { createdAt: 'desc' },
        })

        return { results: alertas }
    })

    // Criar Alerta
    app.withTypeProvider<ZodTypeProvider>().post('/', {
        schema: {
            body: z.object({
                tipo_alerta: z.string(),
                mensagem: z.string(),
                produto_id: z.string().uuid().optional(),
                ingrediente_id: z.string().uuid().optional(),
            }),
        },
    }, async (request, reply) => {
        const userId = request.user.sub
        const data = request.body

        const alerta = await prisma.alertaEstoque.create({
            data: {
                userId,
                tipo_alerta: data.tipo_alerta,
                mensagem: data.mensagem,
                produtoId: data.produto_id,
                ingredienteId: data.ingrediente_id,
            }
        })

        return reply.status(201).send(alerta)
    })

    // Resolver Alerta
    app.withTypeProvider<ZodTypeProvider>().put('/:id', {
        schema: {
            params: z.object({ id: z.string().uuid() }),
            body: z.object({
                resolvido: z.boolean(),
            }),
        }
    }, async (request, reply) => {
        const { id } = request.params
        const userId = request.user.sub

        const alerta = await prisma.alertaEstoque.updateMany({
            where: { id, userId },
            data: { resolvido: request.body.resolvido }
        })

        if (alerta.count === 0) return reply.status(404).send()
        return reply.status(200).send()
    })

    // Deletar Alerta
    app.withTypeProvider<ZodTypeProvider>().delete('/:id', {
        schema: { params: z.object({ id: z.string().uuid() }) }
    }, async (request, reply) => {
        const { id } = request.params
        const userId = request.user.sub

        await prisma.alertaEstoque.deleteMany({ where: { id, userId } })
        return reply.status(204).send()
    })
}
