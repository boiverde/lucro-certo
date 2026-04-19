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
        
        const from30d = subDays(new Date(), 30)
        const from14d = subDays(new Date(), 14)

        const user = await prisma.user.findUnique({ 
            where: { id: userId }, 
            select: { margem_balcao: true, margem_delivery: true, margem_marketplace: true, taxa_impostos: true, taxa_cartao: true, custo_fixo_mensal: true }
        })

        if (!user) return reply.status(404).send({ message: "Usuário não encontrado" })

        // 0. ANÁLISE DE VOLUMES E MÉTRICAS ESTATÍSTICAS v2.0
        const todasVendas14d = await prisma.venda.findMany({
            where: { userId, data_venda: { gte: from14d } },
            include: { itens: true }
        })

        const ldiarios: Record<string, { vol: number, lucro: number, skus: Set<string> }> = {}
        const totalSKUsNoPeriodo = new Set<string>()

        todasVendas14d.forEach(v => {
            const d = format(v.data_venda, 'yyyy-MM-dd')
            if (!ldiarios[d]) ldiarios[d] = { vol: 0, lucro: 0, skus: new Set() }
            
            v.itens.forEach(i => {
                ldiarios[d].vol += Number(i.quantidade)
                ldiarios[d].lucro += (Number(i.lucro_unitario || 0) * Number(i.quantidade))
                ldiarios[d].skus.add(i.produtoId as string)
                totalSKUsNoPeriodo.add(i.produtoId as string)
            })
        })

        const lucrosArray = Object.values(ldiarios).map(d => d.lucro)
        const mediaLucro = lucrosArray.length > 0 ? (lucrosArray.reduce((a, b) => a + b, 0) / lucrosArray.length) : 0
        const totalAmostra = Object.values(ldiarios).reduce((acc, d) => acc + d.vol, 0)

        // Piso Tau (τ) - Relevância Estatística (Ex: Mínimo R$ 50/dia de lucro para projetar)
        const TAU_PISO = 50.0;
        const hasRelevancia = mediaLucro >= TAU_PISO && totalAmostra >= 10

        // Coeficiente de Variação (CV)
        const variancia = lucrosArray.length > 0 ? lucrosArray.reduce((acc, val) => acc + Math.pow(val - mediaLucro, 2), 0) / lucrosArray.length : 0
        const CV = mediaLucro > 0 ? Math.max(0.1, Math.min(1.0, Math.sqrt(variancia) / mediaLucro)) : 1

        // 1. D-DAY ADAPTATIVO v2.0
        const desvioTotal = Math.max(0, Number(await prisma.gastoOperacional.aggregate({ _sum: { valor: true }, where: { userId, data: { gte: from14d } } }).then(r => r._sum.valor || 0)) - ((Number(user.custo_fixo_mensal || 0) / 30) * 14))
        const fatorSeguranca = 1 - CV
        const dDayMin = (hasRelevancia && mediaLucro > 0) ? Math.ceil(desvioTotal / (mediaLucro * (fatorSeguranca + 0.1))) : null
        const dDayMax = (hasRelevancia && mediaLucro > 0) ? Math.ceil(desvioTotal / (mediaLucro * (fatorSeguranca - 0.1))) : null

        // 2. DETECÇÃO DE REGIME v2.0 (REQUISITO: 3 SKUs DISTINTOS)
        const volumesArray = Object.values(ldiarios).map(d => d.vol).sort((a, b) => a - b)
        const p75 = volumesArray[Math.floor(volumesArray.length * 0.75)] || 1
        const ultimos5Ruptrura = Object.values(ldiarios).slice(-5).filter(d => d.vol > (p75 * 1.15)).length
        
        const regimeStatus = (totalAmostra >= 15 && totalSKUsNoPeriodo.size >= 3 && ultimos5Ruptrura >= 4) ? "CONFIRMADO" : 
                           (totalAmostra >= 10 && totalSKUsNoPeriodo.size >= 2 && ultimos5Ruptrura >= 2 ? "FORMAÇÃO" : "ESTÁVEL")

        // 3. RANKING AUTO-CALIBRADO
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
                cv: CV
            }
        }))

        return {
            periodo: { from, to, calibração: "Adaptive v2.0" },
            resumo: {
                hasRelevancia,
                volumeReferencia: Math.round(totalAmostra),
                desvioTotal: Number(desvioTotal.toFixed(2)),
                dDayRange: dDayMin !== null ? `${dDayMin}-${dDayMax} dias` : "Estágio de Observação",
                regime: regimeStatus,
                calibragem: { cv: CV.toFixed(2), skus: totalSKUsNoPeriodo.size, tau: hasRelevancia ? "OK" : "PISO_BAIXO" }
            },
            rankings: { detalhado: ranking.sort((a, b) => b.lucroTotal - a.lucroTotal) }
        }
    })
}
