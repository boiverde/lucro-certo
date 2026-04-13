import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function lotesRoutes(app: FastifyInstance) {
    app.addHook('onRequest', app.authenticate)

    // Listar Lotes
    app.withTypeProvider<ZodTypeProvider>().get('/', {
        schema: {
            querystring: z.object({
                produto_id: z.string().optional(),
                ingrediente_id: z.string().optional(),
                limit: z.string().optional(),
                page: z.string().optional(),
            }),
        },
    }, async (request) => {
        const { produto_id, ingrediente_id, limit, page } = request.query
        const take = Math.min(Number(limit) || 50, 100)
        const skip = (Math.max(Number(page) || 1, 1) - 1) * take
        const userId = request.user.sub

        const where: any = { userId }
        if (produto_id) where.produtoId = produto_id
        if (ingrediente_id) where.ingredienteId = ingrediente_id

        const lotes = await prisma.lote.findMany({
            where,
            include: { produto: true, ingrediente: true },
            take,
            skip,
            orderBy: { data_validade: 'asc' },
        })

        const total = await prisma.lote.count({ where })

        return { 
            results: lotes,
            meta: { page: Math.max(Number(page) || 1, 1), limit: take, total, totalPages: Math.ceil(total / take) }
        }
    })

    // Adicionar Lote
    app.withTypeProvider<ZodTypeProvider>().post('/', {
        schema: {
            body: z.object({
                numero_lote: z.string(),
                data_fabricacao: z.string().datetime().or(z.string()).optional(),
                data_validade: z.string().datetime().or(z.string()),
                quantidade_inicial: z.number(),
                quantidade_atual: z.number().optional(),
                produto_id: z.string().uuid().optional(),
                ingrediente_id: z.string().uuid().optional(),
            }),
        },
    }, async (request, reply) => {
        const userId = request.user.sub
        const data = request.body

        const lote = await prisma.lote.create({
            data: {
                userId,
                numero_lote: data.numero_lote,
                data_fabricacao: data.data_fabricacao ? new Date(data.data_fabricacao) : null,
                data_validade: new Date(data.data_validade),
                quantidade_inicial: data.quantidade_inicial,
                quantidade_atual: data.quantidade_atual !== undefined ? data.quantidade_atual : data.quantidade_inicial,
                produtoId: data.produto_id,
                ingredienteId: data.ingrediente_id,
            }
        })

        return reply.status(201).send(lote)
    })

    // Atualizar Lote
    app.withTypeProvider<ZodTypeProvider>().put('/:id', {
        schema: {
            params: z.object({ id: z.string().uuid() }),
            body: z.object({
                numero_lote: z.string().optional(),
                data_fabricacao: z.string().datetime().or(z.string()).optional(),
                data_validade: z.string().datetime().or(z.string()).optional(),
                quantidade_atual: z.number().optional(),
            }),
        }
    }, async (request, reply) => {
        const { id } = request.params
        const userId = request.user.sub
        const data = request.body

        const updateData: any = { ...data }
        if (data.data_fabricacao) updateData.data_fabricacao = new Date(data.data_fabricacao)
        if (data.data_validade) updateData.data_validade = new Date(data.data_validade)

        const lote = await prisma.lote.updateMany({
            where: { id, userId },
            data: updateData
        })

        if (lote.count === 0) return reply.status(404).send()
        return reply.status(200).send()
    })

    // Deletar Lote
    app.withTypeProvider<ZodTypeProvider>().delete('/:id', {
        schema: { params: z.object({ id: z.string().uuid() }) }
    }, async (request, reply) => {
        const { id } = request.params
        const userId = request.user.sub

        await prisma.lote.deleteMany({ where: { id, userId } })
        return reply.status(204).send()
    })
}
