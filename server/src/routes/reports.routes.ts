import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { startOfMonth, endOfMonth, startOfDay, endOfDay, subDays, eachDayOfInterval, format } from 'date-fns'

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
        const ALPHA = 0.25 

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

        // 0. VOLUME HÍBRIDO + FILTRO DE QUARTIS (P25/P75)
        const vendasItensDiarios = await prisma.venda.findMany({
            where: { userId, data_venda: { gte: from30d, lte: new Date() } },
            include: { itens: true }
        })

        // Agrupar volume por dia
        const volumesPorDiaMap: Record<string, number> = {}
        vendasItensDiarios.forEach(v => {
            const diames = format(v.data_venda, 'yyyy-MM-dd')
            const vol = v.itens.reduce((acc, i) => acc + Number(i.quantidade), 0)
            volumesPorDiaMap[diames] = (volumesPorDiaMap[diames] || 0) + vol
        })

        const serieVolumes = Object.values(volumesPorDiaMap).sort((a, b) => a - b)
        
        // Calcular P25 e P75
        const q1Idx = Math.floor(serieVolumes.length * 0.25)
        const q3Idx = Math.floor(serieVolumes.length * 0.75)
        const volumesFiltrados = serieVolumes.slice(q1Idx, q3Idx + 1)
        const mediaEstavel30d = volumesFiltrados.length > 0 
            ? (volumesFiltrados.reduce((a, b) => a + b, 0) / volumesFiltrados.length) * 30
            : 1

        // EWMA Simplificada (Peso na tendência recente)
        const volumeEWMA = serieVolumes.length > 0 ? serieVolumes[serieVolumes.length - 1] * 20 : 0 // Tendência projetada
        const volumeHibrido = (volumeEWMA * 0.7) + (mediaEstavel30d * 0.3)
        const volumeFinal = Math.max(volumeHibrido, 1)

        // 1. DELTA ACUMULADO (14 DIAS)
        const from14d = subDays(new Date(), 14)
        const [gastos14d, vendas14d] = await Promise.all([
            prisma.gastoOperacional.aggregate({ _sum: { valor: true }, where: { userId, data: { gte: from14d } } }),
            prisma.itemVenda.aggregate({ _sum: { quantidade: true }, where: { venda: { userId, data_venda: { gte: from14d } } } })
        ])

        const volReal14d = Number(vendas14d._sum.quantidade || 0)
        const gastoReal14d = Number(gastos14d._sum.valor || 0)
        const projecaoFixo14d = (Number(user.custo_fixo_mensal || 0) / 30) * 14
        
        const desvioTotalAcumulado = Math.max(0, gastoReal14d - projecaoFixo14d)
        
        const custoFixoUnidProjetado = (Number(user.custo_fixo_mensal || 0) / volumeFinal)
        const desvioUnitarioNecessario = volReal14d > 0 ? (desvioTotalAcumulado / volReal14d) : 0

        // Sintonizar Margem
        const margemMap: any = { balcao: user.margem_balcao, delivery: user.margem_delivery, marketplace: user.margem_marketplace }
        const margemAlvo = Number(margemMap[canal as string] || 30) / 100

        // 2. PROCESSAMENTO DE RANKING
        const performanceProdutos = await prisma.itemVenda.groupBy({
            by: ['produtoId', 'nome_produto'],
            where: { venda: { userId, data_venda: { gte: from, lte: to } } },
            _sum: { quantidade: true, lucro_unitario: true },
            _avg: { margem_liquida: true },
            orderBy: { _sum: { lucro_unitario: true } }
        })

        const ranking = await Promise.all(performanceProdutos.map(async p => {
            const produto = await prisma.produto.findUnique({ where: { id: p.produtoId as string }, select: { custo: true, preco: true } })
            return {
                id: p.produtoId,
                nome: p.nome_produto,
                quantidade: p._sum.quantidade || 0,
                lucroTotal: Number(((p._sum.lucro_unitario || 0) * (p._sum.quantidade || 0)).toFixed(2)),
                margemMedia: Number((p._avg.margem_liquida || 0).toFixed(1)),
                precoAtual: Number(produto?.preco || 0),
                custoBase: Number(produto?.custo || 0),
                deltaRaw: desvioUnitarioNecessario
            }
        }))

        return {
            periodo: { from, to, algoritmo: "Resiliência Híbrida v1.4" },
            resumo: {
                volumeHibrido: Math.round(volumeFinal),
                mediaEstavel30d: Math.round(mediaEstavel30d),
                desvioTotalAcumulado: Number(desvioTotalAcumulado.toFixed(2)),
                gapRecuperacao: volReal14d > 0 ? Number(((desvioTotalAcumulado / (gastoReal14d || 1)) * 100).toFixed(1)) : 0
            },
            rankings: {
                detalhado: ranking.sort((a, b) => b.lucroTotal - a.lucroTotal)
            }
        }
    })
}
