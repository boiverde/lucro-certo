import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { startOfMonth, endOfMonth, startOfDay, endOfDay, subDays } from 'date-fns'

export async function reportsRoutes(app: FastifyInstance) {
    app.addHook('onRequest', app.authenticate)

    app.withTypeProvider<ZodTypeProvider>().get('/performance', {
        schema: {
            querystring: z.object({
                from: z.string().optional(),
                to: z.string().optional(),
                canal: z.string().optional()
            })
        }
    }, async (request, reply) => {
        const userId = request.user.sub
        const from = request.query.from ? startOfDay(new Date(request.query.from)) : startOfMonth(new Date())
        const to = request.query.to ? endOfDay(new Date(request.query.to)) : endOfMonth(new Date())
        const canal = request.query.canal || 'balcao'
        
        // Âncora de 30 dias para estabilidade operacional
        const from30d = subDays(new Date(), 30)

        const user = await prisma.user.findUnique({ 
            where: { id: userId }, 
            select: { 
                plan: true, 
                margem_balcao: true, 
                margem_delivery: true, 
                margem_marketplace: true,
                taxa_impostos: true,
                taxa_cartao: true,
                custo_fixo_mensal: true
            } 
        })

        if (!user) return reply.status(404).send({ message: "Usuário não encontrado" })

        // 0. VOLUME OPERACIONAL (JANELA 30D VS PERÍODO ATUAL)
        const [aggPeriodo, agg30d] = await Promise.all([
            prisma.itemVenda.aggregate({
                _sum: { quantidade: true },
                where: { venda: { userId, data_venda: { gte: from, lte: to } } }
            }),
            prisma.itemVenda.aggregate({
                _sum: { quantidade: true },
                where: { venda: { userId, data_venda: { gte: from30d, lte: new Date() } } }
            })
        ])

        const volumePeriodo = Number(aggPeriodo._sum.quantidade || 0)
        const volumeMedio30d = Number(agg30d._sum.quantidade || 0)
        const volumeReferencia = volumeMedio30d > 0 ? volumeMedio30d : (volumePeriodo > 0 ? volumePeriodo : 1)
        
        // GASTOS REAIS DO PERÍODO
        const totalGastosReaisAgg = await prisma.gastoOperacional.aggregate({
            _sum: { valor: true },
            where: { userId, data: { gte: from, lte: to } }
        })

        const custoFixoMensalProjetado = Number(user.custo_fixo_mensal || 0)
        const gastoFixoRealTotal = Number(totalGastosReaisAgg._sum.valor || 0)

        // Rateios: Sugestão sempre usa a média de 30d (Estabilidade)
        const custoFixoUnidProjetado = volumeReferencia > 0 ? (custoFixoMensalProjetado / volumeReferencia) : 0
        const custoFixoUnidReal = volumePeriodo > 0 ? (gastoFixoRealTotal / volumePeriodo) : custoFixoUnidProjetado

        // Sintonizar a margem alvo pelo canal escolhido
        const margemMap: Record<string, any> = {
            balcao: user.margem_balcao,
            delivery: user.margem_delivery,
            marketplace: user.margem_marketplace
        }
        const margemAlvoRaw = Number(margemMap[canal as string] || 30)
        const margemAlvo = margemAlvoRaw / 100

        // 1. TOP PRODUTOS POR LUCRO E VOLUME
        const performanceProdutos = await prisma.itemVenda.groupBy({
            by: ['produtoId', 'nome_produto'],
            where: { venda: { userId, data_venda: { gte: from, lte: to } } },
            _sum: { quantidade: true, lucro_unitario: true, subtotal: true },
            _avg: { margem_liquida: true },
            orderBy: { _sum: { lucro_unitario: true } }
        })

        // Ranking Detalhado com Cálculos de Ação Implícitos
        const ranking = await Promise.all(performanceProdutos.map(async p => {
            const produtoMeta = await prisma.produto.findUnique({
                where: { id: p.produtoId as string },
                select: { custo: true, preco: true }
            })

            const custoMateriaPrima = Number(produtoMeta?.custo || 0)
            const precoAtual = Number(produtoMeta?.preco || 0)
            const taxas = (Number(user.taxa_impostos || 0) + Number(user.taxa_cartao || 0)) / 100
            
            // Markup Divisor (Sugestão de Estabilidade 30d)
            const custoTotalProjetado = custoMateriaPrima + custoFixoUnidProjetado
            const divisor = 1 - (taxas + margemAlvo)
            const precoSugerido = divisor > 0.05 ? Number((custoTotalProjetado / divisor).toFixed(2)) : precoAtual * 1.3
            
            // Delta de Recuperação (Δ): Quanto custa o estouro do fixo neste produto
            const desvioFixo = Math.max(0, custoFixoUnidReal - custoFixoUnidProjetado)
            const deltaPrecoRecuperacao = divisor > 0 ? Number((desvioFixo / divisor).toFixed(2)) : 0
            
            const lucroTotalEfetivo = Number(((p._sum.lucro_unitario || 0) * (p._sum.quantidade || 0)).toFixed(2))
            const margemRealizada7d = Number((p._avg.margem_liquida || 0).toFixed(1))

            return {
                id: p.produtoId,
                nome: p.nome_produto,
                quantidade: p._sum.quantidade || 0,
                lucroTotal: lucroTotalEfetivo,
                margemMedia: margemRealizada7d,
                margemAlvo: margemAlvoRaw,
                precoAtual,
                precoSugerido,
                deltaRecuperacao: deltaPrecoRecuperacao,
                ganhoPotencial: Math.max(0, precoSugerido - precoAtual) * (p._sum.quantidade || 0)
            }
        }))

        ranking.sort((a, b) => b.lucroTotal - a.lucroTotal)

        const isFree = user.plan === 'free'
        const topLucro = isFree ? ranking.slice(0, 3) : ranking.slice(0, 10)
        const alertaCritico = [...ranking]
            .filter(p => p.margemMedia < 20 || p.lucroTotal < 0 || p.deltaRecuperacao > 0)
            .sort((a, b) => b.deltaRecuperacao - a.deltaRecuperacao)
            .slice(0, isFree ? 2 : 10)

        const totalPerdaOportunidade = ranking.reduce((acc, p) => acc + p.ganhoPotencial, 0)

        const [vendasAgg, comprasAgg] = await Promise.all([
            prisma.venda.aggregate({
                _sum: { valor_total: true },
                where: { userId, data_venda: { gte: from, lte: to } }
            }),
            prisma.compra.aggregate({
                _sum: { valor_total: true },
                where: { userId, data_compra: { gte: from, lte: to } }
            })
        ])

        const totalVendas = Number(vendasAgg._sum.valor_total || 0)
        const totalCompras = Number(comprasAgg._sum.valor_total || 0)
        const lucroLiquidoReal = totalVendas - totalCompras - gastoFixoRealTotal

        return {
            periodo: { from, to, referencia: '30 dias (Média)' },
            resumo: {
                faturamento: totalVendas,
                gastosOperacionaisReais: gastoFixoRealTotal,
                gastosOperacionaisProjetados: custoFixoMensalProjetado,
                lucroLiquidoReal: Number(lucroLiquidoReal.toFixed(2)),
                impactoFinanceiro: Number(totalPerdaOportunidade.toFixed(2)),
                volumeReferencia
            },
            rankings: {
                maisLucrativos: topLucro,
                alertaCritico: alertaCritico
            },
            insights: ranking.length > 0 ? {
                estabilidade: "Sugestões de preço ancoradas na média móvel de 30 dias.",
                alertaDelta: ranking.some(p => p.deltaRecuperacao > 0) ? "Alguns itens precisam de micro-ajustes (Δ) para cobrir o estouro de custo fixo." : "Custos fixos dentro da meta projetada."
            } : null
        }
    })
}
