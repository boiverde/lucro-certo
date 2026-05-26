import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function movimentacoesRoutes(app: FastifyInstance) {
    app.addHook('onRequest', (app as any).authenticate)

    // Listar Movimentações
    app.withTypeProvider<ZodTypeProvider>().get('/', {
        schema: {
            querystring: z.object({
                limit: z.string().transform(Number).default('50'),
            }),
        },
    }, async (request) => {
        const { limit } = request.query
        const userId = (request.user as any).sub

        const movimentacoes = await prisma.movimentacaoEstoque.findMany({
            where: { userId },
            include: { produto: true },
            orderBy: { data: 'desc' },
            take: limit
        })

        return { results: movimentacoes }
    })

    // Criar Movimentação Manual
    app.withTypeProvider<ZodTypeProvider>().post('/', {
        schema: {
            body: z.object({
                produto_id: z.string().uuid(),
                quantidade: z.number(),
                tipo: z.enum(['entrada', 'saida', 'perda', 'ajuste']),
                data: z.string(),
                observacoes: z.string().optional(),
                origem: z.string().default('manual')
            })
        }
    }, async (request) => {
        const userId = (request.user as any).sub
        const data = request.body

        const result = await prisma.$transaction(async (tx) => {
            // 1. Criar Registo
            const mov = await tx.movimentacaoEstoque.create({
                data: {
                    userId,
                    produtoId: data.produto_id,
                    quantidade: data.quantidade,
                    tipo: data.tipo,
                    data: new Date(data.data), // Pode ser data passada
                    origem: data.origem,
                    observacoes: data.observacoes
                }
            })

            // 2. Atualizar Estoque Produto
            const produto = await tx.produto.findUniqueOrThrow({ where: { id: data.produto_id } })
            let novoEstoque = produto.estoque_atual

            if (data.tipo === 'entrada') {
                novoEstoque += data.quantidade
            } else if (data.tipo === 'saida' || data.tipo === 'perda') {
                novoEstoque -= data.quantidade
            } else if (data.tipo === 'ajuste') {
                novoEstoque = data.quantidade
            }

            // Evitar negativo? O frontend trata com Math.max(0), vamos repetir
            novoEstoque = Math.max(0, novoEstoque)

            await tx.produto.update({
                where: { id: data.produto_id },
                data: { estoque_atual: novoEstoque }
            })

            return mov
        })

        return result
    })
}
