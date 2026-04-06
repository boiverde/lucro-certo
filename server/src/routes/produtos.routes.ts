import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function produtosRoutes(app: FastifyInstance) {
    app.addHook('onRequest', app.authenticate)

    // Listar Produtos
    app.withTypeProvider<ZodTypeProvider>().get('/', {
        schema: {
            querystring: z.object({
                nome: z.string().optional(),
                ativo: z.string().transform(v => v === 'true').optional(),
            }),
        },
    }, async (request) => {
        const { nome, ativo } = request.query
        const userId = request.user.sub

        const produtos = await prisma.produto.findMany({
            where: {
                userId,
                nome: nome ? { contains: nome } : undefined,
                ativo: ativo !== undefined ? ativo : undefined,
            },
            orderBy: { nome: 'asc' },
        })

        return { results: produtos } // Formato Base44-like
    })

    // Criar Produto
    app.withTypeProvider<ZodTypeProvider>().post('/', {
        schema: {
            body: z.object({
                nome: z.string(),
                preco: z.number(),
                custo: z.number().optional(),
                estoque_atual: z.number().optional(),
                unidade: z.string().default('un'),
                controla_estoque: z.boolean().default(false),
            }),
        },
    }, async (request) => {
        const userId = request.user.sub
        const data = request.body

        const produto = await prisma.produto.create({
            data: {
                ...data,
                userId,
            },
        })
        return produto
    })

    // Atualizar Produto
    app.withTypeProvider<ZodTypeProvider>().put('/:id', {
        schema: {
            params: z.object({ id: z.string().uuid() }),
            body: z.object({
                nome: z.string().optional(),
                preco: z.number().optional(),
                custo: z.number().optional(),
                estoque_atual: z.number().optional(),
                unidade: z.string().optional(),
                controla_estoque: z.boolean().optional(),
                ativo: z.boolean().optional(),
            }),
        },
    }, async (request, reply) => {
        const { id } = request.params
        const userId = request.user.sub

        const check = await prisma.produto.findFirst({ where: { id, userId } })
        if (!check) return reply.status(404).send()

        const produto = await prisma.produto.update({
            where: { id },
            data: request.body,
        })
        return produto
    })

    // Deletar
    app.withTypeProvider<ZodTypeProvider>().delete('/:id', {
        schema: {
            params: z.object({ id: z.string().uuid() }),
        },
    }, async (request, reply) => {
        const { id } = request.params
        const userId = request.user.sub

        const check = await prisma.produto.findFirst({ where: { id, userId } })
        if (!check) return reply.status(404).send()

        await prisma.produto.delete({ where: { id } })
        return reply.status(204).send()
    })
}
