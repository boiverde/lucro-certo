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
                to: z.string().optional(),
                canal: z.string().optional()
            })
        }
    }, async (request, reply) => {
        const userId = request.user.sub
        const from = request.query.from ? startOfDay(new Date(request.query.from)) : startOfMonth(new Date())
        const to = request.query.to ? endOfDay(new Date(request.query.to)) : endOfMonth(new Date())
        const canal = request.query.canal || 'balcao'
        
        const from30d = subDays(new Date(), 30)
        const from14d = subDays(new Date(), 14)

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

        // 0. ANÁLISE QUARTÍLICA COM HISTERESE
        const todasVendas = await prisma.venda.findMany({
            where: { userId, data_venda: { gte: from30d } },
            include: { itens: true }
        })

        const volumesDiarios: Record<string, number> = {}
        todasVendas.forEach(v => {
            const d = format(v.data_venda, 'yyyy-MM-dd')
            volumesDiarios[d] = (volumesDiarios[d] || 0) + v.itens.reduce((acc, i) => acc + Number(i.quantidade), 0)
        })

        const serieSorted = Object.values(volumesDiarios).sort((a, b) => a - b)
        const p25 = serieSorted[Math.floor(serieSorted.length * 0.25)] || 0
        const p75 = serieSorted[Math.floor(serieSorted.length * 0.75)] || 1
        
        // Histerese: 15% de magnitude para romper a banda
        const upperThreshold = p75 * 1.15
        const lowerThreshold = p25 * 0.85

        // 1. DETECÇÃO DE REGIME COM COOLDOWN
        const ultimos7Dias = Array.from({ length: 7 }).map((_, i) => format(subDays(new Date(), i), 'yyyy-MM-dd'))
        const diasRuptura = ultimos7Dias.filter(d => {
            const vol = volumesDiarios[d] || 0
            return vol > upperThreshold || (vol < lowerThreshold && vol > 0)
        }).length
        
        const isNovoRegime = diasRuptura >= 5
        const volumeReferencia = isNovoRegime 
            ? (Object.values(volumesDiarios).slice(-5).reduce((a, b) => a + b, 0) / 5) * 30
            : (serieSorted.reduce((a, b) => a + b, 0) / (serieSorted.length || 1)) * 30

        // 2. D-DAY PROBABILÍSTICO (INTERVALO CONSERVADOR)
        const [gastos14d, itens14d] = await Promise.all([
            prisma.gastoOperacional.aggregate({ _sum: { valor: true }, where: { userId, data: { gte: from14d } } }),
            prisma.itemVenda.aggregate({ _sum: { quantidade: true, lucro_unitario: true }, where: { venda: { userId, data_venda: { gte: from14d } } } })
        ])

        const gastoReal14d = Number(gastos14d._sum.valor || 0)
        const projecaoFixo14d = (Number(user.custo_fixo_mensal || 0) / 30) * 14
        const desvioTotal = Math.max(0, gastoReal14d - projecaoFixo14d)
        
        const lucroMedioDiario = Number(itens14d._sum.lucro_unitario || 0) / 14
        const dDayMin = lucroMedioDiario > 0 ? Math.ceil(desvioTotal / (lucroMedioDiario * 1.2)) : null
        const dDayMax = lucroMedioDiario > 0 ? Math.ceil(desvioTotal / (lucroMedioDiario * 0.8)) : null

        // 3. RANKING ELITE
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
                deltaRaw: desvioTotal / (Number(itens14d._sum.quantidade || 1))
            }
        }))

        return {
            periodo: { from, to, engine: "Elite Control v1.6" },
            resumo: {
                volumeReferencia: Math.round(volumeReferencia),
                desvioTotal: Number(desvioTotal.toFixed(2)),
                dDayRange: dDayMin !== null ? `${dDayMin}-${dDayMax} dias` : "Equilibrado",
                statusRegime: isNovoRegime ? "MUDANÇA_DETECTADA" : "ESTÁVEL",
                indicadores: { histerese: "15%", magnitude: diasRuptura }
            },
            rankings: { detalhado: ranking.sort((a, b) => b.lucroTotal - a.lucroTotal) }
        }
    })
}
