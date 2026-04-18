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

    app.get('/funnel', async (request, reply) => {
        try {
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

            const totalRevenue = await prisma.transaction.aggregate({
                where: { status: 'approved' },
                _sum: { amount: true }
            })

            const rpv = stats.view > 0 ? (Number(totalRevenue._sum.amount || 0) / stats.view).toFixed(2) : 0

            const allEvents = await prisma.analyticsEvent.findMany({
                where: { event: { in: ['upgrade_view', 'pix_paid', 'upgrade_close'] } }
            })

            const abResults = {
                variant_A: allEvents.filter(e => e.event === 'upgrade_view' && (e.metadata as any)?.ab_variant === 'A').length,
                variant_B: allEvents.filter(e => e.event === 'upgrade_view' && (e.metadata as any)?.ab_variant === 'B').length
            }

            const planStats = { monthly: 0, yearly: 0 }
            allEvents.filter(e => e.event === 'pix_paid').forEach(p => {
                const planId = (p.metadata as any)?.planId
                if (planId === 'pro_yearly') planStats.yearly++
                else if (planId === 'pro_monthly') planStats.monthly++
            })

            const firstABEvent = allEvents.find(e => (e.metadata as any)?.ab_variant)
            const testDays = firstABEvent 
                ? Math.ceil((new Date().getTime() - new Date(firstABEvent.timestamp).getTime()) / (1000 * 60 * 60 * 24))
                : 0

            const segmentStats: any = {
                high: { views: 0, sales: 0, revenue: 0 },
                medium: { views: 0, sales: 0, revenue: 0 },
                low: { views: 0, sales: 0, revenue: 0 }
            }

            allEvents.forEach(e => {
                const meta = e.metadata as any
                const seg = meta?.user_segment
                if (seg && segmentStats[seg]) {
                    if (e.event === 'upgrade_view') segmentStats[seg].views++
                    if (e.event === 'pix_paid') {
                        segmentStats[seg].sales++
                        segmentStats[seg].revenue += meta.planId === 'pro_yearly' ? 249 : 29.99
                    }
                }
            })

            const segmentedResults = Object.keys(segmentStats).map(key => ({
                segment: key,
                rpv: segmentStats[key].views > 0 ? (segmentStats[key].revenue / segmentStats[key].views).toFixed(2) : 0,
                conversion: segmentStats[key].views > 0 ? (segmentStats[key].sales / segmentStats[key].views * 100).toFixed(1) : 0
            }))

            const vMetrics: any = {}
            allEvents.forEach(e => {
                const meta = e.metadata as any
                if (meta?.ab_variant && meta?.user_segment) {
                    const key = `${meta.ab_variant}_${meta.user_segment}`
                    if (!vMetrics[key]) vMetrics[key] = { views: 0, revenue: 0 }
                    if (e.event === 'upgrade_view') vMetrics[key].views++
                    if (e.event === 'pix_paid') {
                        vMetrics[key].revenue += meta.planId === 'pro_yearly' ? 249 : 29.99
                    }
                }
            })

            const liftStats: any = {
                high: { A_rpv: 0, B_rpv: 0, lift: 0 },
                medium: { A_rpv: 0, B_rpv: 0, lift: 0 },
                low: { A_rpv: 0, B_rpv: 0, lift: 0 }
            }

            Object.keys(liftStats).forEach(seg => {
                const rpvA = vMetrics[`A_${seg}`]?.views > 0 ? vMetrics[`A_${seg}`].revenue / vMetrics[`A_${seg}`].views : 0
                const rpvB = vMetrics[`B_${seg}`]?.views > 0 ? vMetrics[`B_${seg}`].revenue / vMetrics[`B_${seg}`].views : 0
                liftStats[seg].A_rpv = rpvA.toFixed(2)
                liftStats[seg].B_rpv = rpvB.toFixed(2)
                liftStats[seg].lift = rpvA > 0 ? ((rpvB - rpvA) / rpvA * 100).toFixed(1) : 0
            })

            const channels: any = {}
            allEvents.forEach(c => {
                const source = (c.metadata as any)?.utm_source || 'organic'
                if (!channels[source]) channels[source] = { views: 0, paid: 0, revenue: 0 }
                if (c.event === 'upgrade_view') channels[source].views++
                if (c.event === 'pix_paid') {
                    channels[source].paid++
                    const planId = (c.metadata as any)?.planId
                    channels[source].revenue += (planId === 'pro_yearly' ? 249 : 29.99)
                }
            })

            const unitEconomics = Object.keys(liftStats).map(seg => {
                const rpvReal = Number(segmentedResults.find(r => r.segment === seg)?.rpv || 0)
                return {
                    segment: seg,
                    ltv_real: (rpvReal * 6).toFixed(2),
                    cac_max: (rpvReal * 6 * 0.4).toFixed(2)
                }
            })

            return { 
                stats, 
                conversion: {
                    view_to_click: stats.view > 0 ? (stats.click / stats.view * 100).toFixed(1) : 0,
                    total_conversion: stats.view > 0 ? (stats.paid / stats.view * 100).toFixed(1) : 0
                },
                recovered: 0, 
                planStats, 
                rpv, 
                annualRate: stats.paid > 0 ? (planStats.yearly / stats.paid * 100).toFixed(1) : 0,
                abResults,
                ab_validity: { is_valid: stats.paid >= 200 || testDays >= 7, days_active: testDays },
                segmentedResults,
                liftStats,
                incrementalRevenue: 0,
                unitEconomics,
                channels
            }
        } catch (error: any) {
            console.error('Analytics Error:', error)
            return reply.status(500).send({ 
                error: 'INTERNAL_SERVER_ERROR', 
                message: error.message,
                stack: error.stack 
            })
        }
    })

    app.get('/active-variants', async () => {
        // Implementação simplificada para evitar Erro 500
        return {
            high: { variant: 'RANDOM', mode: 'exploration', epsilon: 0.5 },
            medium: { variant: 'RANDOM', mode: 'exploration', epsilon: 0.5 },
            low: { variant: 'RANDOM', mode: 'exploration', epsilon: 0.5 }
        }
    })
}
