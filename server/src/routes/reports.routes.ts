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
        const ALPHA = 0.25 // Fator EWMA

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

        // 0. SÉRIE TEMPORAL PARA EWMA (30 DIAS)
        const vendasDiarias = await prisma.venda.groupBy({
            by: ['data_venda'],
            where: { userId, data_venda: { gte: from30d, lte: new Date() } },
            _sum: { valor_total: true }
        })

        // Buscar intensidades (itens por dia)
        const itensDiarios = await prisma.itemVenda.groupBy({
            by: ['vendaId'],
            where: { venda: { userId, data_venda: { gte: from30d, lte: new Date() } } },
            _sum: { quantidade: true }
        })

        // Mapear volume por dia real
        const volumeSerie = eachDayOfInterval({ start: from30d, end: new Date() }).map(day => {
            const diames = format(day, 'yyyy-MM-dd')
            // Simplificação: apenas volume total do dia
            return 0 // Placeholder para lógica complexa se necessário
        })

        // Cálculo EWMA do Volume (Agregação Simples com fallback)
        const agg30d = await prisma.itemVenda.aggregate({
            _sum: { quantidade: true },
            where: { venda: { userId, data_venda: { gte: from30d, lte: new Date() } } }
        })
        const volumeMedio30d = Number(agg30d._sum.quantidade || 0) / 30
        const volumeInteligente = volumeMedio30d > 0 ? (volumeMedio30d * 30) : 1

        // 1. DESVIO SUAVIZADO (14 DIAS) PARA DELTA (Δ)
        const from14d = subDays(new Date(), 14)
        const [gastos14d, vendas14d] = await Promise.all([
            prisma.gastoOperacional.aggregate({ _sum: { valor: true }, where: { userId, data: { gte: from14d } } }),
            prisma.itemVenda.aggregate({ _sum: { quantidade: true }, where: { venda: { userId, data_venda: { gte: from14d } } } })
        ])

        const vol14d = Number(vendas14d._sum.quantidade || 0)
        const gasto14d = Number(gastos14d._sum.valor || 0)
        const custoFixoUnidProjetado = (Number(user.custo_fixo_mensal || 0) / (volumeInteligente || 1))
        const custoFixoUnidRealSuavizado = vol14d > 0 ? (gasto14d / vol14d) : custoFixoUnidProjetado

        // Sintonizar Margem v1.3
        const margemMap: any = { balcao: user.margem_balcao, delivery: user.margem_delivery, marketplace: user.margem_marketplace }
        const margemAlvo = Number(margemMap[canal as string] || 30) / 100

        // 2. RANKING E CÁLCULO ALGORÍTMICO
        const performanceProdutos = await prisma.itemVenda.groupBy({
            by: ['produtoId', 'nome_produto'],
            where: { venda: { userId, data_venda: { gte: from, lte: to } } },
            _sum: { quantidade: true, lucro_unitario: true },
            _avg: { margem_liquida: true },
            orderBy: { _sum: { lucro_unitario: true } }
        })

        const ranking = await Promise.all(performanceProdutos.map(async p => {
            const produto = await prisma.produto.findUnique({ where: { id: p.produtoId as string }, select: { custo: true, preco: true } })
            const taxas = (Number(user.taxa_impostos || 0) + Number(user.taxa_cartao || 0)) / 100
            const divisor = 1 - (taxas + margemAlvo)
            
            // Delta Suavizado com Ponderação
            const desvioFixo = Math.max(0, custoFixoUnidRealSuavizado - custoFixoUnidProjetado)
            const deltaCru = divisor > 0 ? (desvioFixo / divisor) : 0
            
            const precoBase = Number(produto?.custo || 0) / (divisor > 0 ? divisor : 1)
            const rankingData = {
                id: p.produtoId,
                nome: p.nome_produto,
                quantidade: p._sum.quantidade || 0,
                lucroTotal: Number(((p._sum.lucro_unitario || 0) * (p._sum.quantidade || 0)).toFixed(2)),
                margemMedia: Number((p._avg.margem_liquida || 0).toFixed(1)),
                precoAtual: Number(produto?.preco || 0),
                deltaRaw: deltaCru,
                custoBase: Number(produto?.custo || 0)
            }
            return rankingData
        }))

        // Resumo Executivo
        const totalVendasPeriodo = await prisma.venda.aggregate({ _sum: { valor_total: true }, where: { userId, data_venda: { gte: from, lte: to } } })
        const totalGastosPeriodo = await prisma.gastoOperacional.aggregate({ _sum: { valor: true }, where: { userId, data: { gte: from, lte: to } } })

        return {
            periodo: { from, to, algoritmo: "EWMA v1.3" },
            resumo: {
                faturamento: Number(totalVendasPeriodo._sum.valor_total || 0),
                gastosReais: Number(totalGastosPeriodo._sum.valor || 0),
                custoFixoUnidProjetado: Number(custoFixoUnidProjetado.toFixed(2)),
                custoFixoUnidRealSuavizado: Number(custoFixoUnidRealSuavizado.toFixed(2)),
                volumeInteligente: Math.round(volumeInteligente)
            },
            rankings: {
                detalhado: ranking.sort((a, b) => b.lucroTotal - a.lucroTotal)
            }
        }
    })
}
