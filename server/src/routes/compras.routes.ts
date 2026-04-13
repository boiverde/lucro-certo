import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function comprasRoutes(app: FastifyInstance) {
    app.addHook('onRequest', app.authenticate)

    // Listar Compras
    app.withTypeProvider<ZodTypeProvider>().get('/', {
        schema: {
            querystring: z.object({
                data_inicio: z.string().optional(),
                data_fim: z.string().optional(),
                fornecedor: z.string().optional(),
                limit: z.string().optional(),
                page: z.string().optional(),
            }),
        },
    }, async (request) => {
        const { data_inicio, data_fim, fornecedor, limit, page } = request.query
        const take = Math.min(Number(limit) || 50, 100)
        const skip = (Math.max(Number(page) || 1, 1) - 1) * take
        const userId = request.user.sub

        const where: any = { userId }

        if (data_inicio) {
            where.data_compra = {
                gte: new Date(data_inicio),
                lte: data_fim ? new Date(data_fim) : undefined,
            }
        }

        if (fornecedor) {
            where.fornecedor_nome = { contains: fornecedor }
        }

        const compras = await prisma.compra.findMany({
            where,
            include: {
                itens: true,
            },
            take,
            skip,
            orderBy: { data_compra: 'desc' },
        })

        const total = await prisma.compra.count({ where })

        return { 
            results: compras,
            meta: { page: Math.max(Number(page) || 1, 1), limit: take, total, totalPages: Math.ceil(total / take) }
        }
    })

    // Criar Compra (Transacional)
    app.withTypeProvider<ZodTypeProvider>().post('/', {
        schema: {
            body: z.object({
                data_compra: z.string().datetime().or(z.string()),
                data_pagamento: z.string().optional().or(z.literal('')),
                valor_total: z.number(),
                fornecedor: z.string().optional(), // Nome livre
                observacoes: z.string().optional(),
                adicionar_estoque: z.boolean().optional(),

                // Dados do item único (padrão do form atual)
                produto: z.string().optional(), // Nome do produto
                produto_estoque_id: z.string().optional(), // ID se selecionado
                quantidade: z.number(),
                unidade_compra: z.string().optional(),
                valor_por_unidade: z.number().optional(),
            }),
        },
    }, async (request) => {
        const userId = request.user.sub
        const data = request.body

        // Definir data pagamento
        let data_pagamento = null
        if (data.data_pagamento) {
            data_pagamento = new Date(data.data_pagamento)
        }

        const result = await prisma.$transaction(async (tx) => {
            let finalProdutoId = data.produto_estoque_id || null

            // 1. Criar novo produto se solicitado e não enviado ID
            if (data.adicionar_estoque && !finalProdutoId) {
                const novoProduto = await tx.produto.create({
                    data: {
                        userId,
                        nome: data.produto || 'Item sem nome',
                        preco: data.valor_por_unidade || 0,
                        custo: data.valor_por_unidade || 0,
                        estoque_atual: 0,
                        unidade: data.unidade_compra || 'un',
                        controla_estoque: true
                    }
                })
                finalProdutoId = novoProduto.id
            }

            // 2. Criar a Compra
            const compra = await tx.compra.create({
                data: {
                    userId,
                    data_compra: new Date(data.data_compra),
                    data_pagamento,
                    valor_total: data.valor_total,
                    fornecedor_nome: data.fornecedor,
                    observacoes: data.observacoes,
                    itens: {
                        create: [{
                            nome_produto: data.produto || 'Item sem nome',
                            produtoId: finalProdutoId,
                            quantidade: data.quantidade,
                            unidade: data.unidade_compra,
                            preco_unitario: data.valor_por_unidade || 0,
                            subtotal: data.valor_total // Assumindo 1 item
                        }]
                    }
                },
                include: { itens: true }
            })

            // 3. Atualizar Estoque
            if (data.adicionar_estoque && finalProdutoId) {
                await tx.produto.update({
                    where: { id: finalProdutoId },
                    data: { estoque_atual: { increment: data.quantidade } }
                })

                await tx.movimentacaoEstoque.create({
                    data: {
                        userId,
                        produtoId: finalProdutoId,
                        tipo: 'entrada',
                        quantidade: data.quantidade,
                        origem: 'compra',
                        observacoes: `Compra #${compra.id.slice(0, 8)}`,
                        data: new Date(data.data_compra)
                    }
                })
            }

            return compra
        })

        return result
    })

    // Deletar Compra (Com estorno de estoque)
    app.withTypeProvider<ZodTypeProvider>().delete('/:id', {
        schema: { params: z.object({ id: z.string().uuid() }) }
    }, async (request, reply) => {
        const { id } = request.params
        const userId = request.user.sub

        const compra = await prisma.compra.findFirst({
            where: { id, userId },
            include: { itens: true }
        })

        if (!compra) return reply.status(404).send()

        await prisma.$transaction(async (tx) => {
            for (const item of compra.itens) {
                if (item.produtoId) {
                    await tx.produto.update({
                        where: { id: item.produtoId },
                        data: { estoque_atual: { decrement: item.quantidade } }
                    })
                    await tx.movimentacaoEstoque.create({
                        data: {
                            userId,
                            produtoId: item.produtoId,
                            tipo: 'saida',
                            quantidade: item.quantidade,
                            origem: 'compra',
                            observacoes: `Estorno Compra Excluída #${compra.id.slice(0, 8)}`,
                        }
                    })
                }
            }
            await tx.compra.delete({ where: { id } })
        })

        return reply.status(204).send()
    })
}
