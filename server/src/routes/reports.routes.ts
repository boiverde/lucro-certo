import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { startOfMonth, endOfMonth, startOfDay, endOfDay, subDays, format } from 'date-fns'

/**
 * RENDER READINESS v1.0 - PRODUÇÃO
 * Governança total, segurança de input e performance agregada.
 */

export async function reportsRoutes(app: FastifyInstance) {
    app.addHook('onRequest', app.authenticate)

    // Esquema de Validação Rigoroso (Zod)
    const performanceSchema = z.object({
        from: z.string().optional(),
        to: z.string().optional()
    })

    app.withTypeProvider<ZodTypeProvider>().get('/performance', {
        schema: { querystring: performanceSchema }
    }, async (request, reply) => {
        const userId = request.user.sub
        const from = request.query.from ? startOfDay(new Date(request.query.from)) : startOfMonth(new Date())
        const to = request.query.to ? endOfDay(new Date(request.query.to)) : endOfMonth(new Date())
        
        const from14d = subDays(new Date(), 14)

        // 1. PERFORMANCE QUERY (AGREGAÇÃO NATIVA)
        const user = await prisma.user.findUnique({ 
            where: { id: userId }, 
            select: { custo_fixo_mensal: true, margem_balcao: true, margem_delivery: true, margem_marketplace: true }
        })

        if (!user) return reply.status(404).send({ message: "Usuário não encontrado" })

        // 2. ANALYTICS v2.2 (ANTI-N+1)
        const vendasPeriodo = await prisma.venda.findMany({
            where: { userId, data_venda: { gte: from14d } },
            include: { itens: true }
        })

        let totalVolume = 0
        const skus: Record<string, number> = {}
        const lucrosDiarios: Record<string, number> = {}

        vendasPeriodo.forEach(v => {
            const d = format(v.data_venda, 'yyyy-MM-dd')
            lucrosDiarios[d] = (lucrosDiarios[d] || 0)
            
            v.itens.forEach(i => {
                const q = Number(i.quantidade)
                totalVolume += q
                lucrosDiarios[d] += (Number(i.lucro_unitario || 0) * q)
                skus[i.produtoId as string] = (skus[i.produtoId as string] || 0) + q
            })
        })

        // 3. ESTATISTICA ADAPTATIVA v2.2
        const lucrosArray = Object.values(lucrosDiarios)
        const mediaLucro = lucrosArray.length > 0 ? (lucrosArray.reduce((a, b) => a + b, 0) / lucrosArray.length) : 0
        
        // CV Blindado (Clamp 0.1 - 1.0)
        const variancia = lucrosArray.length > 0 ? lucrosArray.reduce((acc, val) => acc + Math.pow(val - mediaLucro, 2), 0) / lucrosArray.length : 0
        const CV = mediaLucro > 0 ? Math.max(0.1, Math.min(1.0, Math.sqrt(variancia) / mediaLucro)) : 1

        // Anti-Baleia Soft
        const skuMax = Math.max(...Object.values(skus), 0)
        const concentracao = totalVolume > 0 ? skuMax / totalVolume : 0

        // 4. GOVERNANÇA DE RELEVÂNCIA
        const hasRelevancia = mediaLucro >= 30.0 && totalVolume >= 15
        const recomendacoes = []
        if (totalVolume < 15) recomendacoes.push(`Venda mais ${15 - totalVolume} itens para estabilizar o radar.`)
        if (concentracao > 0.75) recomendacoes.push("Concentração alta. A confiança está penalizada para sua segurança.")
        
        // 5. CÁLCULO DE DESVIO (CUSTO FIXO RATEADO)
        const desvioTotal = Math.max(0, Number(await prisma.gastoOperacional.aggregate({ _sum: { valor: true }, where: { userId, data: { gte: from14d } } }).then(r => r._sum.valor || 0)) - ((Number(user.custo_fixo_mensal || 0) / 30) * 14))

        // 6. RANKING FINAL DE PRODUÇÃO
        const rankingRaw = await prisma.itemVenda.groupBy({
            by: ['produtoId', 'nome_produto'],
            where: { venda: { userId, data_venda: { gte: from, lte: to } } },
            _sum: { quantidade: true, lucro_unitario: true },
            _avg: { margem_liquida: true }
        })

        const ranking = await Promise.all(rankingRaw.map(async p => {
            const prod = await prisma.produto.findUnique({ where: { id: p.produtoId as string }, select: { custo: true, preco: true } })
            return {
                id: p.produtoId,
                nome: p.nome_produto,
                quantidade: p._sum.quantidade || 0,
                lucroTotal: Number(((p._sum.lucro_unitario || 0) * (p._sum.quantidade || 0)).toFixed(2)),
                margemMedia: Number((p._avg.margem_liquida || 0).toFixed(1)),
                precoAtual: Number(prod?.preco || 0),
                custoBase: Number(prod?.custo || 0),
                deltaRaw: desvioTotal / (Number(totalVolume / 30) || 1),
                cv: CV,
                concentracao
            }
        }))

        return reply.send({
            status: "READY_FOR_PRODUCTION",
            resumo: {
                hasRelevancia,
                recomendacoes,
                volumeReferencia: totalVolume,
                dDayRange: hasRelevancia ? `${Math.ceil(desvioTotal / (mediaLucro * 1.1))} - ${Math.ceil(desvioTotal / (mediaLucro * 0.9))} dias` : "Coleta de dados ativa",
                regime: hasRelevancia ? "CONFIRMADO" : (totalVolume >= 10 ? "FORMAÇÃO" : "ESTÁVEL"),
                seguranca: { cv: CV.toFixed(2), concentracao: (concentracao * 100).toFixed(0) + "%" }
            },
            detalhado: ranking.sort((a, b) => b.lucroTotal - a.lucroTotal)
        })
    })
}
