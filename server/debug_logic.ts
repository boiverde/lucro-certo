
import { prisma } from './src/lib/prisma';

async function testLogic() {
    try {
        console.log('Iniciando teste de lógica de analytics...');

        const events = await prisma.analyticsEvent.groupBy({
            by: ['event'],
            _count: { id: true }
        });
        console.log('Eventos agrupados com sucesso.');

        const stats = {
            view: events.find(e => e.event === 'upgrade_view')?._count.id || 0,
            click: events.find(e => e.event === 'upgrade_click')?._count.id || 0,
            qrcode: events.find(e => e.event === 'pix_created')?._count.id || 0,
            paid: events.find(e => e.event === 'pix_paid')?._count.id || 0
        };

        const totalRevenue = await prisma.transaction.aggregate({
            where: { status: 'approved' },
            _sum: { amount: true }
        });
        console.log('Receita total calculada.');

        const abEvents = await prisma.analyticsEvent.findMany({
            where: { event: 'upgrade_view' },
            select: { metadata: true }
        });

        const abResults = {
            variant_A: abEvents.filter(s => (s.metadata as any)?.ab_variant === 'A').length,
            variant_B: abEvents.filter(s => (s.metadata as any)?.ab_variant === 'B').length
        };
        console.log('Métricas A/B processadas.');

        const paidEvents = await prisma.analyticsEvent.findMany({
            where: { event: 'pix_paid' },
            select: { metadata: true }
        });

        const planStats = { monthly: 0, yearly: 0 };
        paidEvents.forEach(p => {
            const planId = (p.metadata as any)?.planId;
            if (planId === 'pro_yearly') planStats.yearly++;
            else if (planId === 'pro_monthly') planStats.monthly++;
        });

        // Testando a linha 98 que eu suspeito (JSON path query)
        console.log('Testando query de confiança A/B...');
        const firstABEvent = await prisma.analyticsEvent.findFirst({
            where: { metadata: { path: ['ab_variant'], not: null } },
            orderBy: { timestamp: 'asc' }
        });

        console.log('Lógica concluída com SUCESSO!');
        process.exit(0);
    } catch (error) {
        console.error('--- ERRO DETECTADO ---');
        console.error(error);
        process.exit(1);
    }
}

testLogic();
