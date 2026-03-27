import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function gastosPessoaisRoutes(app: FastifyInstance) {
    app.addHook('onRequest', app.authenticate)

    // Listar
    app.withTypeProvider<ZodTypeProvider>().get('/', {
        schema: {
            querystring: z.object({
                data_inicio: z.string().optional(),
                data_fim: z.string().optional(),
            }),
        },
    }, async (request) => {
        const { data_inicio, data_fim } = request.query
        const userId = request.user.sub

        const where: any = { userId }
        if (data_inicio) {
            where.data = {
                gte: new Date(data_inicio),
                lte: data_fim ? new Date(data_fim) : undefined,
            }
        }

        const gastos = await prisma.gastoPessoal.findMany({
            where,
            orderBy: { data: 'desc' },
        })

        return { results: gastos }
    })

    // Criar
    app.withTypeProvider<ZodTypeProvider>().post('/', {
        schema: {
            body: z.object({
                descricao: z.string(),
                categoria: z.string().optional(),
                valor: z.number(),
                data: z.string().datetime().or(z.string()),
            }),
        },
    }, async (request, reply) => {
        const userId = request.user.sub
        const data = request.body

        const gasto = await prisma.gastoPessoal.create({
            data: {
                userId,
                descricao: data.descricao,
                categoria: data.categoria,
                valor: data.valor,
                data: new Date(data.data),
            }
        })

        return reply.status(201).send(gasto)
    })

    // Atualizar
    app.withTypeProvider<ZodTypeProvider>().put('/:id', {
        schema: {
            params: z.object({ id: z.string().uuid() }),
            body: z.object({
                descricao: z.string().optional(),
                categoria: z.string().optional(),
                valor: z.number().optional(),
                data: z.string().datetime().or(z.string()).optional(),
            }),
        }
    }, async (request, reply) => {
        const { id } = request.params
        const userId = request.user.sub
        const data = request.body

        const updateData: any = { ...data }
        if (data.data) {
            updateData.data = new Date(data.data)
        }

        const gasto = await prisma.gastoPessoal.updateMany({
            where: { id, userId },
            data: updateData
        })

        if (gasto.count === 0) return reply.status(404).send()
        return reply.status(200).send()
    })

    // Deletar
    app.withTypeProvider<ZodTypeProvider>().delete('/:id', {
        schema: { params: z.object({ id: z.string().uuid() }) }
    }, async (request, reply) => {
        const { id } = request.params
        const userId = request.user.sub

        await prisma.gastoPessoal.deleteMany({ where: { id, userId } })
        return reply.status(204).send()
    })
}
