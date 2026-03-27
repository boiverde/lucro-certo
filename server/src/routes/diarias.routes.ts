import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function diariasRoutes(app: FastifyInstance) {
    app.addHook('onRequest', app.authenticate)

    // Listar Diarias
    app.withTypeProvider<ZodTypeProvider>().get('/', {
        schema: {
            querystring: z.object({
                funcionario_id: z.string().optional(),
                foi_pago: z.string().optional(), // 'true' ou 'false'
            }),
        },
    }, async (request) => {
        const { funcionario_id, foi_pago } = request.query
        const userId = request.user.sub

        const where: any = { userId }
        if (funcionario_id) where.funcionarioId = funcionario_id
        if (foi_pago !== undefined) where.foi_pago = foi_pago === 'true'

        const diarias = await prisma.diaria.findMany({
            where,
            include: { funcionario: true },
            orderBy: { data_diaria: 'desc' },
        })

        return { results: diarias }
    })

    // Adicionar Diaria
    app.withTypeProvider<ZodTypeProvider>().post('/', {
        schema: {
            body: z.object({
                funcionario_id: z.string().uuid(),
                valor: z.number(),
                data_diaria: z.string().datetime().or(z.string()).optional(),
                foi_pago: z.boolean().optional().default(false),
                observacoes: z.string().optional(),
            }),
        },
    }, async (request, reply) => {
        const userId = request.user.sub
        const data = request.body

        const diaria = await prisma.diaria.create({
            data: {
                userId,
                funcionarioId: data.funcionario_id,
                valor: data.valor,
                data_diaria: data.data_diaria ? new Date(data.data_diaria) : new Date(),
                foi_pago: data.foi_pago,
                observacoes: data.observacoes,
            }
        })

        return reply.status(201).send(diaria)
    })

    // Atualizar Diaria
    app.withTypeProvider<ZodTypeProvider>().put('/:id', {
        schema: {
            params: z.object({ id: z.string().uuid() }),
            body: z.object({
                valor: z.number().optional(),
                foi_pago: z.boolean().optional(),
                observacoes: z.string().optional(),
            }),
        }
    }, async (request, reply) => {
        const { id } = request.params
        const userId = request.user.sub
        const data = request.body

        const diaria = await prisma.diaria.updateMany({
            where: { id, userId },
            data
        })

        if (diaria.count === 0) return reply.status(404).send()
        return reply.status(200).send()
    })

    // Deletar Diaria
    app.withTypeProvider<ZodTypeProvider>().delete('/:id', {
        schema: { params: z.object({ id: z.string().uuid() }) }
    }, async (request, reply) => {
        const { id } = request.params
        const userId = request.user.sub

        await prisma.diaria.deleteMany({ where: { id, userId } })
        return reply.status(204).send()
    })
}
