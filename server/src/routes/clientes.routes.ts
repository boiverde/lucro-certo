import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function clientesRoutes(app: FastifyInstance) {
    // Middleware de Auth para todas as rotas
    app.addHook('onRequest', app.authenticate)

    // Listar Clientes
    app.withTypeProvider<ZodTypeProvider>().get('/', {
        schema: {
            querystring: z.object({
                nome: z.string().optional(),
                page: z.string().transform(Number).default('1'),
                limit: z.string().transform(Number).default('20'),
            }),
        },
    }, async (request) => {
        const { nome, page, limit } = request.query
        const userId = request.user.sub

        const where = {
            userId,
            nome: nome ? { contains: nome } : undefined,
        }

        const [clientes, total] = await Promise.all([
            prisma.cliente.findMany({
                where,
                take: limit,
                skip: (page - 1) * limit,
                orderBy: { nome: 'asc' },
            }),
            prisma.cliente.count({ where }),
        ])

        return {
            results: clientes,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        }
    })

    // Criar Cliente
    app.withTypeProvider<ZodTypeProvider>().post('/', {
        schema: {
            body: z.object({
                nome: z.string(),
                email: z.string().email().optional().or(z.literal('')),
                telefone: z.string().optional(),
            }),
        },
    }, async (request) => {
        const { nome, email, telefone } = request.body
        const userId = request.user.sub

        const cliente = await prisma.cliente.create({
            data: {
                nome,
                email: email || null,
                telefone,
                userId,
            },
        })

        return cliente
    })

    // Atualizar Cliente
    app.withTypeProvider<ZodTypeProvider>().put('/:id', {
        schema: {
            params: z.object({ id: z.string().uuid() }),
            body: z.object({
                nome: z.string().optional(),
                email: z.string().email().optional().or(z.literal('')),
                telefone: z.string().optional(),
                ativo: z.boolean().optional(),
            }),
        },
    }, async (request, reply) => {
        const { id } = request.params
        const data = request.body
        const userId = request.user.sub

        // Validar propriedade
        const exists = await prisma.cliente.findFirst({ where: { id, userId } })
        if (!exists) return reply.status(404).send({ message: 'Cliente não encontrado' })

        const cliente = await prisma.cliente.update({
            where: { id },
            data: {
                ...data,
                email: data.email || null,
            },
        })

        return cliente
    })

    // Deletar Cliente (Soft Delete via ativo=false ou Hard Delete?)
    // Por padrão, se tiver vendas vinculadas, hard delete falha. Vou fazer Hard Delete mas o Prisma vai reclamar se tiver cascade ou fk.
    // Vou manter simples: tenta deletar.
    app.withTypeProvider<ZodTypeProvider>().delete('/:id', {
        schema: {
            params: z.object({ id: z.string().uuid() }),
        },
    }, async (request, reply) => {
        const { id } = request.params
        const userId = request.user.sub

        const exists = await prisma.cliente.findFirst({ where: { id, userId } })
        if (!exists) return reply.status(404).send({ message: 'Cliente não encontrado' })

        try {
            await prisma.cliente.delete({ where: { id } })
            return reply.status(204).send()
        } catch (error) {
            // Possivelmente erro de FK
            return reply.status(400).send({ message: 'Não é possível excluir cliente com vendas vinculadas.' })
        }
    })
}
