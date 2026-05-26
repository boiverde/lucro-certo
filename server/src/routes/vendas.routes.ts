import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { calculateFinancials } from '../utils/pricing'

export async function vendasRoutes(app: FastifyInstance) {
    app.addHook('onRequest', (app as any).authenticate)

    // Listar Vendas
    app.withTypeProvider<ZodTypeProvider>().get('/', {
        schema: {
            querystring: z.object({
                data_inicio: z.string().optional(), // YYYY-MM-DD
                data_fim: z.string().optional(),
                limit: z.string().optional(),
                page: z.string().optional(),
            }),
        },
    }, async (request) => {
        const { data_inicio, data_fim, limit, page } = request.query
        const take = Math.min(Number(limit) || 50, 100)
        const skip = (Math.max(Number(page) || 1, 1) - 1) * take
        const userId = (request.user as any).sub

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
            take,
            skip,
            orderBy: { data_venda: 'desc' },
        })

        const total = await prisma.venda.count({ where })

        return { 
            results: vendas,
            meta: { page: Math.max(Number(page) || 1, 1), limit: take, total, totalPages: Math.ceil(total / take) }
        }
    })

    // Criar Venda Completa
    app.withTypeProvider<ZodTypeProvider>().post('/', {
        schema: {
            body: z.object({
                data_venda: z.string().datetime().or(z.string()),
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
        const userId = (request.user as any).sub
        const { itens, ...vendaData } = request.body

        // 1. Validar plano e buscar configurações
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { 
                plan: true,
                taxa_impostos: true,
                taxa_cartao: true,
                custo_fixo_mensal: true,
                margem_balcao: true 
            }
        })

        if (!user) throw new Error("Usuário não encontrado")

        if (user.plan === 'free') {
            const now = new Date()
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
            const total = await prisma.venda.count({
                where: { userId, createdAt: { gte: startOfMonth } }
            })

            if (total >= 30) { // Limite do plano gratuito: 30 vendas/mês
                return reply.status(403).send({
                    error: "LIMIT_REACHED",
                    message: "Você atingiu o limite de teste de 5 vendas no plano gratuito."
                })
            }
        }

        // 2. Preparar Itens com Dados Financeiros
        const itensComFinanceiro = await Promise.all(itens.map(async (item) => {
            let custoBase = 0
            if (item.produtoId) {
                const prod = await prisma.produto.findUnique({ 
                    where: { id: item.produtoId },
                    select: { custo: true, nome: true }
                })
                
                // CÉREBRO DE LOJISTA: Se o produto tem receita, o custo é a soma dos ingredientes corrigidos
                const receita = await prisma.receitaProduto.findFirst({
                    where: { nome_produto: prod?.nome, userId },
                    include: { ingredientes: { include: { ingrediente: true } } }
                })

                if (receita && receita.ingredientes.length > 0) {
                    console.log(`[Finance] Calculando custo real via Receita para: ${prod?.nome}`);
                    custoBase = receita.ingredientes.reduce((acc, ing) => {
                        // Usamos o preco_corrigido_kg (Fator de Bacon/Rendimento)
                        return acc + (Number(ing.ingrediente.preco_corrigido_kg) * ing.quantidade_kg)
                    }, 0)
                } else {
                    custoBase = Number(prod?.custo) || 0
                }
            }

            const finance = calculateFinancials(custoBase, item.preco_unitario, {
                taxa_impostos: Number(user.taxa_impostos) || 0,
                taxa_cartao: Number(user.taxa_cartao) || 0,
                // Rateio adaptativo: Custo Mensal / quantidade de unidades de referência
                custo_fixo_mensal: Number(user.custo_fixo_mensal) || 0,
                unidades_vendidas_mes: 150, // Referência de volume mensal
                margem_lucro_padrao: Number(user.margem_balcao) || 30,
            })

            return {
                ...item,
                custo_total_unitario: finance.custoTotalBase,
                taxas_aplicadas: finance.taxasVariaveisDec,
                lucro_unitario: finance.lucroRealUnitario,
                margem_liquida: finance.margemReal
            }
        }))

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
                        create: itensComFinanceiro.map(item => ({
                            produtoId: item.produtoId || null,
                            nome_produto: item.nome_produto,
                            quantidade: item.quantidade,
                            preco_unitario: item.preco_unitario,
                            subtotal: item.subtotal,
                            custo_total_unitario: item.custo_total_unitario,
                            taxas_aplicadas: item.taxas_aplicadas,
                            lucro_unitario: item.lucro_unitario,
                            margem_liquida: item.margem_liquida
                        }))
                    }
                },
                include: { itens: true }
            })

            // 3. ATUALIZAÇÃO DE ESTOQUE INTELIGENTE (CÉREBRO DE LOJISTA)
            for (const item of itens) {
                if (item.produtoId) {
                    const produtoInfo = await tx.produto.findUnique({ where: { id: item.produtoId } })
                    if (!produtoInfo) throw { statusCode: 404, message: `Produto não encontrado`, code: 'NOT_FOUND' }
                    
                    // 3.1. Baixa no estoque do Produto Final (se controlado)
                    if (produtoInfo.controla_estoque) {
                        if (produtoInfo.estoque_atual < item.quantidade) {
                             throw { 
                                statusCode: 400, 
                                message: `Estoque insuficiente para o produto "${produtoInfo.nome}". Disponível: ${produtoInfo.estoque_atual}`,
                                code: 'BUSINESS_RULE_ERROR'
                             }
                        }
                        await tx.produto.update({
                            where: { id: item.produtoId },
                            data: { estoque_atual: { decrement: item.quantidade } }
                        })
                    }

                    // 3.2. BAIXA AUTOMÁTICA EM CASCATA (Ficha Técnica / Receita)
                    // Verificamos se este produto tem uma receita (ingredientes que devem ser descontados)
                    const receita = await tx.receitaProduto.findFirst({
                        where: { nome_produto: produtoInfo.nome, userId },
                        include: { ingredientes: true }
                    })

                    if (receita) {
                        for (const ingredienteItem of receita.ingredientes) {
                            // Calculamos o gasto total do ingrediente: Qtd na Receita (kg) * Qtd Vendida
                            const baixaGrama = ingredienteItem.quantidade_kg * item.quantidade;
                            
                            await tx.ingrediente.update({
                                where: { id: ingredienteItem.ingredienteId },
                                data: { estoque_atual: { decrement: baixaGrama } }
                            })

                            console.log(`[Venda] Baixa automática no Insumo: ID ${ingredienteItem.ingredienteId} | Qtd: ${baixaGrama}kg`);
                        }
                    }

                    // Registrar movimentação de saída do item mestre
                    await tx.movimentacaoEstoque.create({
                        data: {
                            userId,
                            produtoId: item.produtoId,
                            quantidade: item.quantidade,
                            tipo: 'saida',
                            origem: 'venda',
                            observacoes: `Venda #${venda.id.slice(0, 8)} - Baixa em cascata realizada`,
                            data: new Date(vendaData.data_venda)
                        }
                    })
                }
            }

            return venda
        })

        return result
    })

    // Deletar Venda com Devolução de Estoque
    app.withTypeProvider<ZodTypeProvider>().delete('/:id', {
        schema: {
            params: z.object({ id: z.string().uuid() }),
        },
    }, async (request, reply) => {
        const { id } = request.params
        const userId = (request.user as any).sub

        // 1. Verificar se a venda existe e pertence ao usuário
        const venda = await prisma.venda.findFirst({ 
            where: { id, userId },
            include: { itens: true }
        })
        
        if (!venda) throw { statusCode: 404, message: 'Venda não encontrada' }

        // 2. Executar deleção e devolução em uma única transação
        await prisma.$transaction(async (tx) => {
            // Devolver itens ao estoque
            for (const item of venda.itens) {
                if (item.produtoId) {
                    await tx.produto.update({
                        where: { id: item.produtoId },
                        data: { estoque_atual: { increment: item.quantidade } }
                    })

                    // Registrar movimentação de ajuste (entrada por exclusão)
                    await tx.movimentacaoEstoque.create({
                        data: {
                            userId,
                            produtoId: item.produtoId,
                            quantidade: item.quantidade,
                            tipo: 'entrada',
                            origem: 'ajuste',
                            observacoes: `Estorno: Venda #${venda.id.slice(0, 8)} excluída`,
                            data: new Date()
                        }
                    })
                }
            }

            // Excluir a venda (os itens serão excluídos via CASCADE configurado no Prisma)
            await tx.venda.delete({ where: { id } })
        })

        return reply.status(204).send()
    })
}
