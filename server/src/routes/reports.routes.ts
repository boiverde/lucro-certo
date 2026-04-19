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
                to: z.string().optional(),
                canal: z.string().optional()
            })
        }
    }, async (request, reply) => {
        const userId = request.user.sub
        const from = request.query.from ? startOfDay(new Date(request.query.from)) : startOfMonth(new Date())
        const to = request.query.to ? endOfDay(new Date(request.query.to)) : endOfMonth(new Date())
        const canal = request.query.canal || 'balcao'

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

        // 0. RATEIO DE CUSTO FIXO (PROJETADO VS REAL)
        const totalVendasPeriodo = await prisma.itemVenda.aggregate({
            _sum: { quantidade: true },
            where: {
                venda: {
                    userId,
                    data_venda: { gte: from, lte: to }
                }
            }
        })

        const volumeTotal = Number(totalVendasPeriodo._sum.quantidade || 0)
        
        const totalGastosReaisAgg = await prisma.gastoOperacional.aggregate({
            _sum: { valor: true },
            where: {
                userId,
                data: { gte: from, lte: to }
            }
        })

        const custoFixoMensalProjetado = Number(user.custo_fixo_mensal || 0)
        const gastoFixoRealTotal = Number(totalGastosReaisAgg._sum.valor || 0)

        // Preço Sugerido sempre usa o PROJETADO para estabilidade
        const custoFixoUnidProjetado = volumeTotal > 0 ? (custoFixoMensalProjetado / volumeTotal) : 0
        const custoFixoUnidReal = volumeTotal > 0 ? (gastoFixoRealTotal / volumeTotal) : 0

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
                    lucro_unitario: true
                }
            }
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
            
            // Sugestão baseada no Projetado (Hardening)
            const custoTotalProjetado = custoMateriaPrima + custoFixoUnidProjetado
            const divisor = 1 - (taxas + margemAlvo)
            const precoSugerido = divisor > 0.05 ? Number((custoTotalProjetado / divisor).toFixed(2)) : precoAtual * 1.3
            
            // Cálculo de Lucro Real (O que sobrou DE FATO no período)
            const custoTotalReal = custoMateriaPrima + custoFixoUnidReal
            const lucroTotalEfetivo = Number(((p._sum.lucro_unitario || 0) * (p._sum.quantidade || 0)).toFixed(2))
            
            // Perda Potencial (Baseada no Preço Sugerido)
            const lucroAlvoUnitario = precoSugerido - custoTotalProjetado - (precoSugerido * taxas)
            const ganhoSeCorrigido = Number(((lucroAlvoUnitario * (p._sum.quantidade || 0)) - lucroTotalEfetivo).toFixed(2))

            return {
                id: p.produtoId,
                nome: p.nome_produto,
                quantidade: p._sum.quantidade || 0,
                lucroTotal: lucroTotalEfetivo,
                margemMedia: Number((p._avg.margem_liquida || 0).toFixed(1)),
                precoAtual,
                precoSugerido,
                ganhoPotencial: Math.max(0, ganhoSeCorrigido)
            }
        }))

        ranking.sort((a, b) => b.lucroTotal - a.lucroTotal)

        const isFree = user.plan === 'free'
        const topLucro = isFree ? ranking.slice(0, 3) : ranking.slice(0, 10)
        const alertaCritico = [...ranking]
            .filter(p => p.margemMedia < 20 || p.lucroTotal < 0)
            .sort((a, b) => b.ganhoPotencial - a.ganhoPotencial)
            .slice(0, isFree ? 2 : 10)

        const totalPerdaOportunidade = ranking.reduce((acc, p) => acc + p.ganhoPotencial, 0)

        // 2. RESUMO POR PERÍODO (Agregações atômicas)
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
            periodo: { from, to },
            isPartial: isFree,
            resumo: {
                faturamento: totalVendas,
                compras: totalCompras,
                gastosOperacionaisReais: gastoFixoRealTotal,
                gastosOperacionaisProjetados: custoFixoMensalProjetado,
                lucroLiquidoReal: Number(lucroLiquidoReal.toFixed(2)),
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
                    ? `Perda de oportunidade de R$ ${totalPerdaOportunidade.toFixed(2)}. Corrija seus preços agora.`
                    : (lucroLiquidoReal < 0 ? "Atenção: Gastos REAIS superaram o faturamento." : "Tudo sob controle!")
            } : null
        }
    })
}
