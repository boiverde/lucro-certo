import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { startOfMonth, endOfMonth, startOfDay, endOfDay, subDays, format } from 'date-fns'

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
        const from = request.query.from ? startOfDay(new Date(request.query.from)) : startOfMonth(new Date())
        const to = request.query.to ? endOfDay(new Date(request.query.to)) : endOfMonth(new Date())
        
        const from14d = subDays(new Date(), 14)

        const user = await prisma.user.findUnique({ 
            where: { id: userId }, 
            select: { margem_balcao: true, margem_delivery: true, margem_marketplace: true, taxa_impostos: true, taxa_cartao: true, custo_fixo_mensal: true }
        })

        if (!user) return reply.status(404).send({ message: "Usuário não encontrado" })

        // 0. ANÁLISE ADAPTATIVA v2.2
        const todasVendas14d = await prisma.venda.findMany({
            where: { userId, data_venda: { gte: from14d } },
            include: { itens: true }
        })

        let totalAmostra = 0
        const globalSKUs: Record<string, number> = {}
        const ldiarios: Record<string, { vol: number, lucro: number }> = {}

        todasVendas14d.forEach(v => {
            const d = format(v.data_venda, 'yyyy-MM-dd')
            if (!ldiarios[d]) ldiarios[d] = { vol: 0, lucro: 0 }
            v.itens.forEach(i => {
                const q = Number(i.quantidade)
                totalAmostra += q
                ldiarios[d].vol += q
                ldiarios[d].lucro += (Number(i.lucro_unitario || 0) * q)
                globalSKUs[i.produtoId as string] = (globalSKUs[i.produtoId as string] || 0) + q
            })
        })

        const skuDominanteVolume = Math.max(...Object.values(globalSKUs), 0)
        const concentracao = totalAmostra > 0 ? skuDominanteVolume / totalAmostra : 0
        const lucrosArray = Object.values(ldiarios).map(d => d.lucro)
        const mediaLucro = lucrosArray.length > 0 ? (lucrosArray.reduce((a, b) => a + b, 0) / lucrosArray.length) : 0
        
        // EWMA Adaptativo (Sensor de Tendência)
        const variancia = lucrosArray.length > 0 ? lucrosArray.reduce((acc, val) => acc + Math.pow(val - mediaLucro, 2), 0) / lucrosArray.length : 0
        const CV = mediaLucro > 0 ? Math.max(0.1, Math.min(1.0, Math.sqrt(variancia) / mediaLucro)) : 1

        // 1. REGIME DESBLOQUEADO (Soft Anti-Baleia)
        const hasRelevancia = mediaLucro >= 50.0 && totalAmostra >= 15
        const regimeStatus = hasRelevancia ? "CONFIRMADO" : (totalAmostra >= 10 ? "FORMAÇÃO" : "ESTÁVEL")

        // 2. MOTOR DE RECOMENDAÇÕES
        const recomendacoes = []
        if (totalAmostra < 15) recomendacoes.push(`Venda mais ${15 - totalAmostra} itens para estabilizar o radar.`)
        if (concentracao > 0.70) recomendacoes.push("Alta dependência de um só produto. Diversifique para maior segurança.")
        if (CV > 0.5) recomendacoes.push("Volatilidade alta detectada. Aguarde estabilização antes de grandes saltos.")

        const desvioTotal = Math.max(0, Number(await prisma.gastoOperacional.aggregate({ _sum: { valor: true }, where: { userId, data: { gte: from14d } } }).then(r => r._sum.valor || 0)) - ((Number(user.custo_fixo_mensal || 0) / 30) * 14))

        const performance = await prisma.itemVenda.groupBy({
            by: ['produtoId', 'nome_produto'],
            where: { venda: { userId, data_venda: { gte: from, lte: to } } },
            _sum: { quantidade: true, lucro_unitario: true },
            _avg: { margem_liquida: true },
            orderBy: { _sum: { lucro_unitario: true } }
        })

        const ranking = await Promise.all(performance.map(async p => {
            const prod = await prisma.produto.findUnique({ where: { id: p.produtoId as string }, select: { custo: true, preco: true } })
            return {
                id: p.produtoId,
                nome: p.nome_produto,
                quantidade: p._sum.quantidade || 0,
                lucroTotal: Number(((p._sum.lucro_unitario || 0) * (p._sum.quantidade || 0)).toFixed(2)),
                margemMedia: Number((p._avg.margem_liquida || 0).toFixed(1)),
                precoAtual: Number(prod?.preco || 0),
                custoBase: Number(prod?.custo || 0),
                deltaRaw: desvioTotal / (Number(totalAmostra / 30) || 1),
                cv: CV,
                concentracao: concentracao
            }
        }))

        return {
            periodo: { engine: "Adaptive Decision v2.2" },
            resumo: {
                hasRelevancia,
                recomendacoes,
                volumeReferencia: Math.round(totalAmostra),
                desvioTotal: Number(desvioTotal.toFixed(2)),
                dDayRange: hasRelevancia ? `${Math.ceil(desvioTotal / (mediaLucro * 1.1))} - ${Math.ceil(desvioTotal / (mediaLucro * 0.9))} dias` : "Coletando massa histórica",
                regime: regimeStatus,
                adaptabilidade: { cv: CV.toFixed(2), concentracao: (concentracao * 100).toFixed(0) + "%" }
            },
            rankings: { detalhado: ranking.sort((a, b) => b.lucroTotal - a.lucroTotal) }
        }
    })
}
