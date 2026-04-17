import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function analyticsRoutes(app: FastifyInstance) {
    app.addHook('onRequest', app.authenticate)

    app.withTypeProvider<ZodTypeProvider>().post('/event', {
        schema: {
            body: z.object({
                event: z.string(),
                origin: z.string().optional(),
                metadata: z.any().optional(),
            }),
        },
    }, async (request, reply) => {
        const userId = request.user.sub
        const { event, origin, metadata } = request.body

        await prisma.analyticsEvent.create({
            data: {
                userId,
                event,
                origin,
                metadata: metadata || {},
            }
        })

        return reply.status(204).send()
    })

    // Métricas do Funil de Conversão
    app.get('/funnel', async (request) => {
        const events = await prisma.analyticsEvent.groupBy({
            by: ['event'],
            _count: { id: true }
        })

        const stats = {
            view: events.find(e => e.event === 'upgrade_view')?._count.id || 0,
            click: events.find(e => e.event === 'upgrade_click')?._count.id || 0,
            qrcode: events.find(e => e.event === 'pix_created')?._count.id || 0,
            paid: events.find(e => e.event === 'pix_paid')?._count.id || 0
        }

        // Recuperação de pagamentos (cliques em banners de pendente)
        const recovered = await prisma.analyticsEvent.count({
            where: { 
                event: 'upgrade_view', 
                origin: { contains: 'pagamento' } 
            }
        })

        const conversion = {
            view_to_click: stats.view > 0 ? (stats.click / stats.view * 100).toFixed(1) : 0,
            click_to_paid: stats.click > 0 ? (stats.paid / stats.click * 100).toFixed(1) : 0,
            total_conversion: stats.view > 0 ? (stats.paid / stats.view * 100).toFixed(1) : 0,
            recovery_rate: stats.qrcode > 0 ? (recovered / stats.qrcode * 100).toFixed(1) : 0
        }

        // Receita por Visualização (RPV)
        const totalRevenue = await prisma.transaction.aggregate({
            where: { status: 'approved' },
            _sum: { amount: true }
        })

        const rpv = stats.view > 0 ? (Number(totalRevenue._sum.amount || 0) / stats.view).toFixed(2) : 0

        // Métricas por Variante A/B
        const abStats = await prisma.analyticsEvent.groupBy({
            where: { event: 'upgrade_view' },
            by: ['metadata'],
            _count: { id: true }
        })

        const abResults = {
            variant_A: abStats.find(s => (s.metadata as any)?.ab_variant === 'A')?._count.id || 0,
            variant_B: abStats.find(s => (s.metadata as any)?.ab_variant === 'B')?._count.id || 0
        }

        // Conversão por Tipo de Plano (Anual vs Mensal)
        const planTypes = await prisma.analyticsEvent.groupBy({
            where: { event: 'pix_paid' },
            by: ['metadata'],
            _count: { id: true }
        })

        const planStats = { monthly: 0, yearly: 0 }
        planTypes.forEach(p => {
            const planId = (p.metadata as any)?.planId
            if (planId === 'pro_yearly') planStats.yearly += p._count.id
            else if (planId === 'pro_monthly') planStats.monthly += p._count.id
        })

        // Critérios de Validade do Teste A/B (Confiança)
        const firstABEvent = await prisma.analyticsEvent.findFirst({
            where: { metadata: { path: ['ab_variant'], not: null } },
            orderBy: { timestamp: 'asc' }
        })
        
        const testDays = firstABEvent 
            ? Math.ceil((new Date().getTime() - firstABEvent.timestamp.getTime()) / (1000 * 60 * 60 * 24))
            : 0

        const ab_validity = {
            is_valid: stats.paid >= 200 || testDays >= 7,
            days_active: testDays,
            total_payments: stats.paid
        }

        // Métricas Segmentadas (RPV e Conversão por Perfil)
        const segmentEvents = await prisma.analyticsEvent.findMany({
            where: { event: { in: ['upgrade_view', 'pix_paid'] } },
            select: { event: true, metadata: true }
        })

        const segmentStats: any = {
            high: { views: 0, sales: 0, revenue: 0 },
            medium: { views: 0, sales: 0, revenue: 0 },
            low: { views: 0, sales: 0, revenue: 0 }
        }

        segmentEvents.forEach(e => {
            const seg = (e.metadata as any)?.user_segment as string
            if (seg && segmentStats[seg]) {
                if (e.event === 'upgrade_view') segmentStats[seg].views++
                if (e.event === 'pix_paid') {
                    segmentStats[seg].sales++
                    const planId = (e.metadata as any)?.planId
                    segmentStats[seg].revenue += planId === 'pro_yearly' ? 249 : 29.99
                }
            }
        })

        const segmentedResults = Object.keys(segmentStats).map(key => ({
            segment: key,
            rpv: segmentStats[key].views > 0 ? (segmentStats[key].revenue / segmentStats[key].views).toFixed(2) : 0,
            conversion: segmentStats[key].views > 0 ? (segmentStats[key].sales / segmentStats[key].views * 100).toFixed(1) : 0
        }))

        // Cálculo de Lift por Segmento (Variante B vs Variante A)
        const liftStats: any = {
            high: { A_rpv: 0, B_rpv: 0, lift: 0 },
            medium: { A_rpv: 0, B_rpv: 0, lift: 0 },
            low: { A_rpv: 0, B_rpv: 0, lift: 0 }
        }

        const variantData = await prisma.analyticsEvent.findMany({
            where: { event: { in: ['upgrade_view', 'pix_paid'] } },
            select: { event: true, metadata: true }
        })

        const vMetrics: any = {}
        variantData.forEach(e => {
            const meta = e.metadata as any
            const key = `${meta.ab_variant}_${meta.user_segment}`
            if (!vMetrics[key]) vMetrics[key] = { views: 0, revenue: 0 }
            
            if (e.event === 'upgrade_view') vMetrics[key].views++
            if (e.event === 'pix_paid') {
                vMetrics[key].revenue += meta.planId === 'pro_yearly' ? 249 : 29.99
            }
        })

        Object.keys(liftStats).forEach(seg => {
            const rpvA = vMetrics[`A_${seg}`]?.views > 0 ? vMetrics[`A_${seg}`].revenue / vMetrics[`A_${seg}`].views : 0
            const rpvB = vMetrics[`B_${seg}`]?.views > 0 ? vMetrics[`B_${seg}`].revenue / vMetrics[`B_${seg}`].views : 0
            
            liftStats[seg].A_rpv = rpvA.toFixed(2)
            liftStats[seg].B_rpv = rpvB.toFixed(2)
            liftStats[seg].lift = rpvA > 0 ? ((rpvB - rpvA) / rpvA * 100).toFixed(1) : 0
        })

        // Comportamental: Média de tempo no modal e abandono
        const behavioral = await prisma.analyticsEvent.aggregate({
            where: { event: 'upgrade_close' },
            _avg: { 
                // Usando JSON path para acessar metadado numérico (depende do DB, mas Prisma ajuda)
            }
        })

        const annualRate = stats.paid > 0 ? (planStats.yearly / stats.paid * 100).toFixed(1) : 0

        // UNIT ECONOMICS: LTV e CAC Máximo por Segmento
        const unitEconomics = Object.keys(liftStats).map(seg => {
            const rpv = Number(liftStats[seg].B_rpv || liftStats[seg].A_rpv || 0)
            
            // LTV Estimado (Baseado em 6 meses de retenção média mensal)
            const ltv = rpv * 6
            
            return {
                segment: seg,
                ltv: ltv.toFixed(2),
                cac_max: (ltv * 0.4).toFixed(2), // Alvo de 40% de margem (SaaS health)
                payback_days: rpv > 0 ? Math.ceil((ltv * 0.4) / (rpv / 30)) : 0
            }
        })

        // Incremento de Receita Projetado (Incremental Revenue)
        let incrementalRevenue = 0
        Object.keys(liftStats).forEach(seg => {
            const lift = Number(liftStats[seg].lift)
            const rpvA = Number(liftStats[seg].A_rpv)
            if (lift > 0) {
                const views = vMetrics[`A_${seg}`]?.views || 0
                incrementalRevenue += (rpvA * (lift / 100)) * views
            }
        })

        return { 
            stats, 
            conversion, 
            origins, 
            recovered, 
            planStats, 
            rpv, 
            annualRate,
            abResults,
            ab_validity,
            segmentedResults,
            liftStats,
            incrementalRevenue: incrementalRevenue.toFixed(2),
            unitEconomics
        }
    })

    // Endpoint para decidir qual variante servir (Métrica de Valor de Médio Prazo)
    app.get('/active-variants', async (request) => {
        const now = new Date()
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000))

        const allEvents = await prisma.analyticsEvent.findMany({
            where: { timestamp: { gte: thirtyDaysAgo } },
            select: { event: true, metadata: true, timestamp: true, userId: true },
            orderBy: { timestamp: 'asc' }
        })

        const segments = ['high', 'medium', 'low']
        const decisions: any = {}

        segments.forEach(seg => {
            const userData: any = {} // userId -> stats

            allEvents.forEach(e => {
                const meta = e.metadata as any
                if (meta.user_segment === seg) {
                    if (e.event === 'upgrade_view' && !userData[e.userId]) {
                        userData[e.userId] = { 
                            variant: meta.ab_variant, 
                            firstSeen: e.timestamp, 
                            rev7d: 0, 
                            rev30d: 0, 
                            actions: 0, 
                            frequency: new Set(),
                            planType: null
                        }
                    }

                    if (userData[e.userId]) {
                        const u = userData[e.userId]
                        const days = (e.timestamp.getTime() - u.firstSeen.getTime()) / (1000 * 60 * 60 * 24)
                        
                        // Faturamento por Horizonte
                        if (e.event === 'pix_paid') {
                            const val = meta.planId === 'pro_yearly' ? 249 : 29.99
                            if (days <= 7) u.rev7d += val
                            if (days <= 30) u.rev30d += val
                            u.planType = meta.planId
                        }

                        // Engagement Score (Produtos, Vendas, Frequência)
                        if (['produto_create', 'venda_create'].includes(e.event)) u.actions++
                        u.frequency.add(e.timestamp.toISOString().split('T')[0])
                    }
                }
            })

            // Agregação por Variante
            const vMetrics: any = { A: { users: 0, ev7d: 0, ev30d: 0, qRet: 0, planSplit: { m: 0, y: 0 } }, B: { users: 0, ev7d: 0, ev30d: 0, qRet: 0, planSplit: { m: 0, y: 0 } } }
            
            Object.values(userData).forEach((u: any) => {
                const target = vMetrics[u.variant]
                if (target) {
                    target.users++
                    target.ev7d += u.rev7d
                    target.ev30d += u.rev30d
                    
                    // Definição de Usuário Qualificado (Engagement Score)
                    // Pelo menos 2 dias de uso OU 5+ ações relevantes
                    if (u.frequency.size >= 2 || u.actions >= 5) target.qRet++

                    if (u.planType === 'pro_yearly') target.planSplit.y++
                    else if (u.planType === 'pro_monthly') target.planSplit.m++
                }
            })

            const getFinalMetrics = (v: any) => {
                const count = v.users > 0 ? v.users : 1
                return {
                    ev7d: v.ev7d / count,
                    ev30d: v.ev30d / count, // EV_30d Real/Projetado
                    qRate: v.qRet / count,
                    annualMix: v.planSplit.y / (v.planSplit.y + v.planSplit.m || 1)
                }
            }

            const mA = getFinalMetrics(vMetrics.A)
            const mB = getFinalMetrics(vMetrics.B)

            // NOVA FUNÇÃO DE DECISÃO: SCORE = EV_7d * Retenção Qualificada
            // Isso previne variantes que vendem bem mas entregam usuários inativos
            const scoreA = mA.ev7d * mA.qRate
            const scoreB = mB.ev7d * mB.qRate

            const totalSamples = vMetrics.A.users + vMetrics.B.users
            const epsilon = Math.max(0.05, Math.min(0.5, 2 / Math.sqrt(totalSamples || 1)))

            if (scoreB > (scoreA * 1.10)) {
                decisions[seg] = { variant: 'B', mode: 'winner', epsilon, metrics: { score: scoreB, ev30d: mB.ev30d, annualMix: mB.annualMix } }
            } else if (scoreA > (scoreB * 1.10)) {
                decisions[seg] = { variant: 'A', mode: 'winner', epsilon, metrics: { score: scoreA, ev30d: mA.ev30d, annualMix: mA.annualMix } }
            } else {
                decisions[seg] = { variant: 'RANDOM', mode: 'exploration', epsilon: 0.5 }
            }
        })

        return decisions
    })
}
