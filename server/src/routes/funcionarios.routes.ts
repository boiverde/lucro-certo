import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function funcionariosRoutes(app: FastifyInstance) {
    app.addHook('onRequest', (app as any).authenticate)

    // Listar
    app.withTypeProvider<ZodTypeProvider>().get('/', {
        schema: {
            querystring: z.object({
                nome: z.string().optional(),
            }),
        },
    }, async (request) => {
        const { nome } = request.query
        const userId = (request.user as any).sub

        const where: any = { userId }
        if (nome) {
            where.nome = { contains: nome }
        }

        const funcionarios = await prisma.funcionario.findMany({
            where,
            orderBy: { nome: 'asc' },
        })

        return { results: funcionarios }
    })

    // Adicionar
    app.withTypeProvider<ZodTypeProvider>().post('/', {
        schema: {
            body: z.object({
                nome: z.string(),
                cargo: z.string().optional(),
                telefone: z.string().optional(),
                ativo: z.boolean().optional().default(true),
            }),
        },
    }, async (request, reply) => {
        const userId = (request.user as any).sub
        const data = request.body

        const funcionario = await prisma.funcionario.create({
            data: {
                userId,
                nome: data.nome,
                cargo: data.cargo,
                telefone: data.telefone,
                ativo: data.ativo,
            }
        })

        return reply.status(201).send(funcionario)
    })

    // Atualizar
    app.withTypeProvider<ZodTypeProvider>().put('/:id', {
        schema: {
            params: z.object({ id: z.string().uuid() }),
            body: z.object({
                nome: z.string().optional(),
                cargo: z.string().optional(),
                telefone: z.string().optional(),
                ativo: z.boolean().optional(),
            }),
        }
    }, async (request, reply) => {
        const { id } = request.params
        const userId = (request.user as any).sub
        const data = request.body

        const funcionario = await prisma.funcionario.updateMany({
            where: { id, userId },
            data
        })

        if (funcionario.count === 0) return reply.status(404).send()
        return reply.status(200).send()
    })

    // Deletar
    app.withTypeProvider<ZodTypeProvider>().delete('/:id', {
        schema: { params: z.object({ id: z.string().uuid() }) }
    }, async (request, reply) => {
        const { id } = request.params
        const userId = (request.user as any).sub

        await prisma.funcionario.deleteMany({ where: { id, userId } })
        return reply.status(204).send()
    })
}
