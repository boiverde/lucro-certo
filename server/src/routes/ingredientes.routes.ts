import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function ingredientesRoutes(app: FastifyInstance) {
    app.addHook('onRequest', app.authenticate)

    // Listar
    app.withTypeProvider<ZodTypeProvider>().get('/', {
        schema: {
            querystring: z.object({
                nome: z.string().optional(),
            }),
        },
    }, async (request) => {
        const { nome } = request.query
        const userId = request.user.sub

        const where: any = { userId }
        if (nome) {
            where.nome = { contains: nome, mode: 'insensitive' }
        }

        const ingredientes = await prisma.ingrediente.findMany({
            where,
            orderBy: { nome: 'asc' },
        })

        return { results: ingredientes }
    })

    // Detalhe
    app.withTypeProvider<ZodTypeProvider>().get('/:id', {
        schema: {
            params: z.object({ id: z.string().uuid() })
        }
    }, async (request, reply) => {
        const { id } = request.params
        const userId = request.user.sub

        const ingrediente = await prisma.ingrediente.findFirst({
            where: { id, userId }
        })

        if (!ingrediente) return reply.status(404).send()
        return ingrediente
    })

    // Criar
    app.withTypeProvider<ZodTypeProvider>().post('/', {
        schema: {
            body: z.object({
                nome: z.string(),
                quantidade_comprada: z.number(),
                valor_pago: z.number(),
                preco_por_kg: z.number(),
                fator_correcao: z.number().optional().default(1),
                preco_corrigido_kg: z.number(),
                estoque_atual: z.number(),
                estoque_minimo: z.number().optional().default(0),
                ativo: z.boolean().optional().default(true),
            }),
        },
    }, async (request, reply) => {
        const userId = request.user.sub
        const data = request.body

        const ingrediente = await prisma.ingrediente.create({
            data: {
                userId,
                nome: data.nome,
                quantidade_comprada: data.quantidade_comprada,
                valor_pago: data.valor_pago,
                preco_por_kg: data.preco_por_kg,
                fator_correcao: data.fator_correcao,
                preco_corrigido_kg: data.preco_corrigido_kg,
                estoque_atual: data.estoque_atual,
                estoque_minimo: data.estoque_minimo,
                ativo: data.ativo,
            }
        })

        return reply.status(201).send(ingrediente)
    })

    // Atualizar
    app.withTypeProvider<ZodTypeProvider>().put('/:id', {
        schema: {
            params: z.object({ id: z.string().uuid() }),
            body: z.object({
                nome: z.string().optional(),
                quantidade_comprada: z.number().optional(),
                valor_pago: z.number().optional(),
                preco_por_kg: z.number().optional(),
                fator_correcao: z.number().optional(),
                preco_corrigido_kg: z.number().optional(),
                estoque_atual: z.number().optional(),
                estoque_minimo: z.number().optional(),
                ativo: z.boolean().optional(),
            }),
        }
    }, async (request, reply) => {
        const { id } = request.params
        const userId = request.user.sub
        const data = request.body

        const updateData: any = { ...data }

        const ingrediente = await prisma.ingrediente.updateMany({
            where: { id, userId },
            data: updateData
        })

        if (ingrediente.count === 0) return reply.status(404).send()
        return reply.status(200).send()
    })

    // Deletar
    app.withTypeProvider<ZodTypeProvider>().delete('/:id', {
        schema: { params: z.object({ id: z.string().uuid() }) }
    }, async (request, reply) => {
        const { id } = request.params
        const userId = request.user.sub

        await prisma.ingrediente.deleteMany({ where: { id, userId } })
        return reply.status(204).send()
    })
}
