import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function vendasRoutes(app: FastifyInstance) {
    app.addHook('onRequest', app.authenticate)

    // Listar Vendas
    app.withTypeProvider<ZodTypeProvider>().get('/', {
        schema: {
            querystring: z.object({
                data_inicio: z.string().optional(), // YYYY-MM-DD
                data_fim: z.string().optional(),
            }),
        },
    }, async (request) => {
        const { data_inicio, data_fim } = request.query
        const userId = request.user.sub

        const where: any = { userId }
        if (data_inicio) {
            where.data_venda = {
                gte: new Date(data_inicio),
                lte: data_fim ? new Date(data_fim) : undefined,
            }
        }

        const vendas = await prisma.venda.findMany({
            where,
            include: {
                itens: true,
                cliente: true,
            },
            orderBy: { data_venda: 'desc' },
        })

        return { results: vendas }
    })

    // Criar Venda Completa
    app.withTypeProvider<ZodTypeProvider>().post('/', {
        schema: {
            body: z.object({
                data_venda: z.string().datetime().or(z.string()), // Aceita ISO ou string simples date
                cliente_nome: z.string().optional(),
                clienteId: z.string().uuid().optional(),
                valor_total: z.number(),
                observacoes: z.string().optional(),
                itens: z.array(z.object({
                    produtoId: z.string().uuid().nullable().optional(),
                    nome_produto: z.string(),
                    quantidade: z.number(),
                    preco_unitario: z.number(),
                    subtotal: z.number(),
                })),
            }),
        },
    }, async (request, reply) => {
        const userId = request.user.sub
        const { itens, ...vendaData } = request.body

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { plan: true }
        })

        if (user?.plan === 'free') {
            const now = new Date()
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

            const total = await prisma.venda.count({
                where: {
                    userId,
                    createdAt: {
                        gte: startOfMonth,
                        lte: endOfMonth
                    }
                }
            })

            if (total >= 150) {
                return reply.status(403).send({
                    error: "LIMIT_REACHED",
                    message: "Você atingiu o limite de 150 vendas no plano gratuito."
                })
            }
        }

        try {
            const result = await prisma.$transaction(async (tx) => {
                const venda = await tx.venda.create({
                    data: {
                        userId,
                        cliente_nome: vendaData.cliente_nome,
                        clienteId: vendaData.clienteId,
                        data_venda: new Date(vendaData.data_venda),
                        valor_total: vendaData.valor_total,
                        observacoes: vendaData.observacoes,
                        itens: {
                            create: itens.map(item => ({
                                produtoId: item.produtoId || null,
                                nome_produto: item.nome_produto,
                                quantidade: item.quantidade,
                                preco_unitario: item.preco_unitario,
                                subtotal: item.subtotal
                            }))
                        }
                    },
                    include: { itens: true }
                })

                // Atualizar estoque se tiver produtoId
                for (const item of itens) {
                    if (item.produtoId) {
                        const produtoInfo = await tx.produto.findUnique({ where: { id: item.produtoId } })
                        if (!produtoInfo) throw new Error(`Produto não encontrado`)
                        
                        if (produtoInfo.controla_estoque && produtoInfo.estoque_atual < item.quantidade) {
                            throw new Error(`Estoque insuficiente para o produto "${produtoInfo.nome}". Disponível: ${produtoInfo.estoque_atual}`)
                        }

                        await tx.produto.update({
                            where: { id: item.produtoId },
                            data: { estoque_atual: { decrement: item.quantidade } }
                        })

                        // Registrar movimentação de saída
                        await tx.movimentacaoEstoque.create({
                            data: {
                                userId,
                                produtoId: item.produtoId,
                                quantidade: item.quantidade,
                                tipo: 'saida',
                                origem: 'venda',
                                observacoes: `Venda #${venda.id.slice(0, 8)}`,
                                data: new Date(vendaData.data_venda)
                            }
                        })
                    }
                }

                return venda
            })

            return result
        } catch (error: any) {
            return reply.status(400).send({ message: error.message || 'Erro ao criar venda' })
        }
    })

    // Detalhe Venda
    app.withTypeProvider<ZodTypeProvider>().get('/:id', {
        schema: {
            params: z.object({ id: z.string().uuid() })
        }
    }, async (request, reply) => {
        const { id } = request.params
        const userId = request.user.sub

        const venda = await prisma.venda.findFirst({
            where: { id, userId },
            include: { itens: true, cliente: true }
        })

        if (!venda) return reply.status(404).send()
        return venda
    })

    // Deletar Venda (Com estorno de estoque)
    app.withTypeProvider<ZodTypeProvider>().delete('/:id', {
        schema: { params: z.object({ id: z.string().uuid() }) }
    }, async (request, reply) => {
        const { id } = request.params
        const userId = request.user.sub

        const venda = await prisma.venda.findFirst({
            where: { id, userId },
            include: { itens: true }
        })

        if (!venda) return reply.status(404).send()

        await prisma.$transaction(async (tx) => {
            // Estornar estoque
            for (const item of venda.itens) {
                if (item.produtoId) {
                    await tx.produto.update({
                        where: { id: item.produtoId },
                        data: { estoque_atual: { increment: item.quantidade } }
                    })
                    // Registrar movimentação
                    await tx.movimentacaoEstoque.create({
                        data: {
                            userId,
                            produtoId: item.produtoId,
                            tipo: 'entrada',
                            quantidade: item.quantidade,
                            origem: 'venda',
                            observacoes: `Estorno Venda Excluída #${venda.id.slice(0, 8)}`,
                        }
                    })
                }
            }
            await tx.venda.delete({ where: { id } })
        })

        return reply.status(204).send()
    })
}
