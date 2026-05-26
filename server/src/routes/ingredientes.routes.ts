import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function ingredientesRoutes(app: FastifyInstance) {
    app.addHook('onRequest', (app as any).authenticate)

    // Listar
    app.withTypeProvider<ZodTypeProvider>().get('/', {
        schema: {
            querystring: z.object({
                nome: z.string().optional(),
                limit: z.string().optional(),
                page: z.string().optional(),
            }),
        },
    }, async (request) => {
        const { nome, limit, page } = request.query
        const take = Math.min(Number(limit) || 50, 100)
        const skip = (Math.max(Number(page) || 1, 1) - 1) * take
        const userId = (request.user as any).sub

        const where: any = { userId }
        if (nome) {
            where.nome = { contains: nome }
        }

        const ingredientes = await prisma.ingrediente.findMany({
            where,
            take,
            skip,
            orderBy: { nome: 'asc' },
        })

        const total = await prisma.ingrediente.count({ where })

        return { 
            results: ingredientes,
            meta: { page: Math.max(Number(page) || 1, 1), limit: take, total, totalPages: Math.ceil(total / take) }
        }
    })

    // Detalhe
    app.withTypeProvider<ZodTypeProvider>().get('/:id', {
        schema: {
            params: z.object({ id: z.string().uuid() })
        }
    }, async (request, reply) => {
        const { id } = request.params
        const userId = (request.user as any).sub

        const ingrediente = await prisma.ingrediente.findFirst({
            where: { id, userId }
        })

        if (!ingrediente) return reply.status(404).send()
        return ingrediente
    })

    // Criar Ingrediente com Cálculos de Backend
    app.withTypeProvider<ZodTypeProvider>().post('/', {
        schema: {
            body: z.object({
                nome: z.string(),
                quantidade_comprada: z.number(),
                valor_pago: z.number(),
                preco_por_kg: z.number(),
                fator_correcao: z.number().optional().default(1),
                estoque_atual: z.number(),
                estoque_minimo: z.number().optional().default(0),
                ativo: z.boolean().optional().default(true),
            }),
        },
    }, async (request, reply) => {
        const userId = (request.user as any).sub
        const data = request.body

        // Hardening: Cálculo exato no servidor
        const precoPorKg = data.preco_por_kg
        const fatorCorrecao = data.fator_correcao || 1
        const precoCorrigidoKg = Number((precoPorKg * fatorCorrecao).toFixed(2))

        const ingrediente = await prisma.ingrediente.create({
            data: {
                userId,
                nome: data.nome,
                quantidade_comprada: data.quantidade_comprada,
                valor_pago: data.valor_pago,
                preco_por_kg: precoPorKg,
                fator_correcao: fatorCorrecao,
                preco_corrigido_kg: precoCorrigidoKg,
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
                estoque_atual: z.number().optional(),
                estoque_minimo: z.number().optional(),
                ativo: z.boolean().optional(),
            }),
        }
    }, async (request, reply) => {
        const { id } = request.params
        const userId = (request.user as any).sub
        const data = request.body

        // Buscar dados atuais para recalcular se necessário
        const current = await prisma.ingrediente.findFirst({ where: { id, userId } })
        if (!current) return reply.status(404).send()

        const precoPorKg = data.preco_por_kg ?? Number(current.preco_por_kg)
        const fatorCorrecao = data.fator_correcao ?? Number(current.fator_correcao)
        const precoCorrigidoKg = Number((precoPorKg * fatorCorrecao).toFixed(2))

        const updateData: any = { 
            ...data,
            preco_corrigido_kg: precoCorrigidoKg 
        }

        await prisma.ingrediente.update({
            where: { id },
            data: updateData
        })

        return reply.status(200).send()
    })

    // Deletar com Proteção (Hardening de Integridade)
    app.withTypeProvider<ZodTypeProvider>().delete('/:id', {
        schema: { params: z.object({ id: z.string().uuid() }) }
    }, async (request, reply) => {
        const { id } = request.params
        const userId = (request.user as any).sub

        // Verificação: O ingrediente está em alguma receita?
        const emUso = await prisma.receitaIngrediente.findFirst({
            where: { ingredienteId: id }
        })

        if (emUso) {
            return reply.status(400).send({
                error: 'INGREDIENT_IN_USE',
                message: 'Este ingrediente não pode ser excluído pois está sendo usado em fichas técnicas ativas. Desative-o em vez de excluir.'
            })
        }

        await prisma.ingrediente.delete({ where: { id } })
        return reply.status(204).send()
    })
}
