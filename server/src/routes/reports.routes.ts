import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns'

export async function reportsRoutes(app: FastifyInstance) {
    app.addHook('onRequest', app.authenticate)

    app.withTypeProvider<ZodTypeProvider>().get('/performance', {
        schema: {
            querystring: z.object({
                from: z.string().optional(),
                to: z.string().optional()
            })
        }
    }, async (request, reply) => {
        const userId = request.user.sub
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { plan: true } })
        
        const from = request.query.from ? startOfDay(new Date(request.query.from)) : startOfMonth(new Date())
        const to = request.query.to ? endOfDay(new Date(request.query.to)) : endOfMonth(new Date())

        // 1. TOP PRODUTOS POR LUCRO E VOLUME (Uso do groupBy do Prisma para máxima performance)
        const performanceProdutos = await prisma.itemVenda.groupBy({
            by: ['produtoId', 'nome_produto'],
            where: {
                venda: {
                    userId,
                    data_venda: { gte: from, lte: to }
                }
            },
            _sum: {
                quantidade: true,
                lucro_unitario: true,
                subtotal: true
            },
            _avg: {
                margem_liquida: true
            },
            orderBy: {
                _sum: {
                    lucro_unitario: true // Ordenar pelo lucro unitário somado (aproximação do lucro total)
                }
            }
        })

        // Ranking Detalhado com Cálculos de Ação Implícitos
        const ranking = await Promise.all(performanceProdutos.map(async p => {
            // Buscar custo atual do produto para sugerir novo preço
            const produtoMeta = await prisma.produto.findUnique({
                where: { id: p.produtoId },
                select: { custo_total: true, preco_venda: true, taxas_adicionais: true }
            })

            const custo = Number(produtoMeta?.custo_total || 0)
            const precoAtual = Number(produtoMeta?.preco_venda || 0)
            const taxas = Number(produtoMeta?.taxas_adicionais || 0) / 100
            const margemAlvo = 0.30 // 30% de lucro alvo

            // Cálculo do Preço Sugerido: Custo / (1 - (Taxas + Margem Alvo))
            const divisor = 1 - (taxas + margemAlvo)
            const precoSugerido = divisor > 0 ? Number((custo / divisor).toFixed(2)) : precoAtual * 1.3

            const lucroTotalReal = Number(((p._sum.lucro_unitario || 0) * (p._sum.quantidade || 0)).toFixed(2))
            
            // Perda Potencial: O que ele ganharia se estivesse com o preço sugerido
            const lucroAlvoUnitario = precoSugerido - custo - (precoSugerido * taxas)
            const ganhoSeCorrigido = Number(((lucroAlvoUnitario * (p._sum.quantidade || 0)) - lucroTotalReal).toFixed(2))

            return {
                id: p.produtoId,
                nome: p.nome_produto,
                quantidade: p._sum.quantidade || 0,
                lucroTotal: lucroTotalReal,
                margemMedia: Number((p._avg.margem_liquida || 0).toFixed(1)),
                precoAtual,
                precoSugerido,
                ganhoPotencial: Math.max(0, ganhoSeCorrigido)
            }
        }))

        ranking.sort((a, b) => b.lucroTotal - a.lucroTotal)

        const isFree = user?.plan === 'free'
        const topLucro = isFree ? ranking.slice(0, 3) : ranking.slice(0, 10)
        
        // Alerta Crítico: Onde ele MAIS perde dinheiro ou margem
        const alertaCritico = [...ranking]
            .filter(p => p.margemMedia < 20 || p.lucroTotal < 0)
            .sort((a, b) => b.ganhoPotencial - a.ganhoPotencial) // Ordenar por quem tem maior potencial de recuperação
            .slice(0, isFree ? 2 : 10)

        const totalPerdaOportunidade = ranking.reduce((acc, p) => acc + p.ganhoPotencial, 0)

        // 2. RESUMO POR PERÍODO (Agregações atômicas)
        const [vendasAgg, comprasAgg, gastosAgg] = await Promise.all([
            prisma.venda.aggregate({
                _sum: { valor_total: true },
                where: { userId, data_venda: { gte: from, lte: to } }
            }),
            prisma.compra.aggregate({
                _sum: { valor_total: true },
                where: { userId, data_compra: { gte: from, lte: to } }
            }),
            prisma.gastoOperacional.aggregate({
                _sum: { valor: true },
                where: { userId, data: { gte: from, lte: to } }
            })
        ])

        const totalVendas = Number(vendasAgg._sum.valor_total || 0)
        const totalCompras = Number(comprasAgg._sum.valor_total || 0)
        const totalGastos = Number(gastosAgg._sum.valor || 0)
        const lucroLiquidoEstimado = totalVendas - totalCompras - totalGastos

        return {
            periodo: { from, to },
            isPartial: isFree,
            resumo: {
                faturamento: totalVendas,
                compras: totalCompras,
                gastosOperacionais: totalGastos,
                lucroLiquido: Number(lucroLiquidoEstimado.toFixed(2)),
                impactoFinanceiro: Number(totalPerdaOportunidade.toFixed(2))
            },
            rankings: {
                maisLucrativos: topLucro,
                alertaCritico: alertaCritico
            },
            insights: ranking.length > 0 ? {
                melhorProduto: ranking[0]?.nome,
                piorProduto: ranking[ranking.length - 1]?.nome,
                sugestao: totalPerdaOportunidade > 100 
                    ? `Você pode ganhar R$ ${totalPerdaOportunidade.toFixed(2)} extras este mês corrigindo os produtos em alerta.`
                    : (lucroLiquidoEstimado < 0 ? "Seus gastos superaram as vendas. Revise custos fixos." : "Operação saudável. Continue monitorando as margens.")
            } : null
        }
    })
}
