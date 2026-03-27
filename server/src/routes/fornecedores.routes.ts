import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function fornecedoresRoutes(app: FastifyInstance) {
    app.addHook('onRequest', app.authenticate)

    // Listar Fornecedores
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

        const fornecedores = await prisma.fornecedor.findMany({
            where,
            orderBy: { nome: 'asc' },
        })

        return { results: fornecedores }
    })

    // Adicionar Fornecedor
    app.withTypeProvider<ZodTypeProvider>().post('/', {
        schema: {
            body: z.object({
                nome: z.string(),
                telefone: z.string().optional(),
            }),
        },
    }, async (request, reply) => {
        const userId = request.user.sub
        const data = request.body

        const fornecedor = await prisma.fornecedor.create({
            data: {
                userId,
                nome: data.nome,
                telefone: data.telefone,
            }
        })

        return reply.status(201).send(fornecedor)
    })

    // Atualizar Fornecedor
    app.withTypeProvider<ZodTypeProvider>().put('/:id', {
        schema: {
            params: z.object({ id: z.string().uuid() }),
            body: z.object({
                nome: z.string().optional(),
                telefone: z.string().optional(),
            }),
        }
    }, async (request, reply) => {
        const { id } = request.params
        const userId = request.user.sub
        const data = request.body

        const fornecedor = await prisma.fornecedor.updateMany({
            where: { id, userId },
            data
        })

        if (fornecedor.count === 0) return reply.status(404).send()
        return reply.status(200).send()
    })

    // Deletar Fornecedor
    app.withTypeProvider<ZodTypeProvider>().delete('/:id', {
        schema: { params: z.object({ id: z.string().uuid() }) }
    }, async (request, reply) => {
        const { id } = request.params
        const userId = request.user.sub

        await prisma.fornecedor.deleteMany({ where: { id, userId } })
        return reply.status(204).send()
    })
}
