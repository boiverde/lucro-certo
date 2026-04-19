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

        // Processar os dados em memória (apenas do Top 10) para calcular lucro total real
        const ranking = performanceProdutos.map(p => ({
            id: p.produtoId,
            nome: p.nome_produto,
            quantidade: p._sum.quantidade || 0,
            lucroTotal: Number(((p._sum.lucro_unitario || 0) * (p._sum.quantidade || 0)).toFixed(2)),
            margemMedia: Number((p._avg.margem_liquida || 0).toFixed(1))
        })).sort((a, b) => b.lucroTotal - a.lucroTotal)

        // Limite Freemium (Parte 4)
        const isFree = user?.plan === 'free'
        const topLucro = isFree ? ranking.slice(0, 3) : ranking.slice(0, 10)
        const topPrejuizo = [...ranking].reverse().filter(p => p.lucroTotal <= 0 || p.margemMedia < 15).slice(0, isFree ? 2 : 10)

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
                lucroLiquido: Number(lucroLiquidoEstimado.toFixed(2))
            },
            rankings: {
                maisLucrativos: topLucro,
                alertaCritico: topPrejuizo
            },
            insights: ranking.length > 0 ? {
                melhorProduto: ranking[0]?.nome,
                piorProduto: ranking[ranking.length - 1]?.nome,
                sugestao: lucroLiquidoEstimado < 0 
                    ? "Seus gastos superaram as vendas. Revise custos fixos."
                    : (ranking[0]?.margemMedia < 20 ? "Suas margens estao baixas. Tente reduzir o custo dos insumos." : "Operação saudável. Foque em aumentar o volume de vendas.")
            } : null
        }
    })
}
