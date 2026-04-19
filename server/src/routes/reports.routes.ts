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

        // 0. ANÁLISE DE BANDA COM ESCALONAMENTO
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
        
        // Histerese Adaptativa: 10% (Formação) vs 15% (Confirmado)
        const upper10 = p75 * 1.10
        const upper15 = p75 * 1.15

        const ultimos5Dias = Array.from({ length: 5 }).map((_, i) => format(subDays(new Date(), i), 'yyyy-MM-dd'))
        const freq10 = ultimos5Dias.filter(d => (volumesDiarios[d] || 0) > upper10).length
        const freq15 = ultimos5Dias.filter(d => (volumesDiarios[d] || 0) > upper15).length

        let regimeStatus = "ESTÁVEL"
        if (freq15 >= 4) regimeStatus = "CONFIRMADO"
        else if (freq10 >= 3) regimeStatus = "EM_FORMAÇÃO"

        // 1. D-DAY ROBUSTO (LUCRO BASE + FATOR 0.7)
        const [gastos14d, itens14d] = await Promise.all([
            prisma.gastoOperacional.aggregate({ _sum: { valor: true }, where: { userId, data: { gte: from14d } } }),
            prisma.itemVenda.aggregate({ _sum: { lucro_unitario: true }, where: { venda: { userId, data_venda: { gte: from14d } } } })
        ])

        const desvioTotal = Math.max(0, Number(gastos14d._sum.valor || 0) - ((Number(user.custo_fixo_mensal || 0) / 30) * 14))
        const lucroDiarioBase = Number(itens14d._sum.lucro_unitario || 0) / 14
        
        // Fator conservador agressivo (0.7) para evitar promessas
        const dDayMin = lucroDiarioBase > 0 ? Math.ceil(desvioTotal / (lucroDiarioBase * 0.9)) : null
        const dDayMax = lucroDiarioBase > 0 ? Math.ceil(desvioTotal / (lucroDiarioBase * 0.7)) : null

        // 2. PROCESSAMENTO DE RANKING PREDITIVO
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
                deltaRaw: desvioTotal / (Number(serieSorted.reduce((a, b) => a + b, 0) / 30) || 1)
            }
        }))

        return {
            periodo: { from, to, engine: "Predictive Intelligence v1.7" },
            resumo: {
                volumeReferencia: Math.round((serieSorted.reduce((a, b) => a + b, 0) / (serieSorted.length || 1)) * 30),
                desvioTotal: Number(desvioTotal.toFixed(2)),
                dDayRange: dDayMin !== null ? `${dDayMin}-${dDayMax} dias` : "Equilibrado",
                regime: regimeStatus,
                precisao: "Alta Confiança (70%)"
            },
            rankings: { detalhado: ranking.sort((a, b) => b.lucroTotal - a.lucroTotal) }
        }
    })
}
