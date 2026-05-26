import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { addMonths } from 'date-fns'

export async function dashboardRoutes(app: FastifyInstance) {
    app.addHook('onRequest', (app as any).authenticate)

    app.get('/stats', async (request, reply) => {
        const userId = (request.user as any).sub
        
        // Ajuste de Fuso Horário (Brasil GMT-3) para o Mês Atual
        const agora = new Date()
        const startOfMonth = new Date(agora.getFullYear(), agora.getMonth(), 1, 0, 0, 0, 0)
        const endOfMonth = new Date(agora.getFullYear(), agora.getMonth() + 1, 0, 23, 59, 59, 999)

        // EXECUTANDO AGREGAÇÕES DIRETAS NO BANCO (MUITO MAIS RÁPIDO)
        const [
            user,
            countProdutos,
            countIngredientes,
            vendasAggregate,
            comprasAggregate,
            gastosAggregate,
            comissoesMesAggregate,
            comissoesReceberAggregate,
            countVendasNoMes,
            // Somas de Itens (Lucro e Custo) - Agregando apenas o necessário
            itensVendaSum
        ] = await Promise.all([
            prisma.user.findUnique({ where: { id: userId }, select: { plan: true } }),
            prisma.produto.count({ where: { userId, ativo: true } }),
            prisma.ingrediente.count({ where: { userId, ativo: true } }),
            
            // Soma total de Vendas (Valor Bruto)
            prisma.venda.aggregate({
                _sum: { valor_total: true },
                where: { userId, data_venda: { gte: startOfMonth, lte: endOfMonth } }
            }),

            // Soma total de Compras
            prisma.compra.aggregate({
                _sum: { valor_total: true },
                where: { userId, data_compra: { gte: startOfMonth, lte: endOfMonth } }
            }),

            // Soma total de Gastos Operacionais
            prisma.gastoOperacional.aggregate({
                _sum: { valor: true },
                where: { userId, data: { gte: startOfMonth, lte: endOfMonth } }
            }),

            // Comissões RECEBIDAS no mês (Apenas parcelas pagas com vencimento no mês)
            prisma.parcelaRevenda.aggregate({
                _sum: { valor: true },
                where: { 
                    vendaRevenda: { userId },
                    paga: true,
                    data_vencimento: { gte: startOfMonth, lte: endOfMonth }
                }
            }),

            // Comissões A RECEBER (Total de parcelas não pagas da história)
            prisma.parcelaRevenda.aggregate({
                _sum: { valor: true },
                where: { 
                    vendaRevenda: { userId, status: { not: 'cancelada' } },
                    paga: false
                }
            }),

            // Contagem de vendas para limite do plano
            prisma.venda.count({
                where: { userId, createdAt: { gte: startOfMonth, lte: endOfMonth } }
            }),

            // Soma de lucros dos itens (Evita loop manual)
            // Nota: Somamos lucro_unitario * quantidade em memória ou via Raw Query. 
            // Como Prisma _sum não multiplica colunas, buscamos os itens mas apenas as colunas de soma.
            prisma.itemVenda.findMany({
                where: { venda: { userId, data_venda: { gte: startOfMonth, lte: endOfMonth } } },
                select: { lucro_unitario: true, quantidade: true, margem_liquida: true }
            })
        ])

        // Processamento leve dos itens (Somente os do mês atual)
        let lucroMes = 0
        let margemSomada = 0
        let itensComMargemCount = 0

        itensVendaSum.forEach(item => {
            lucroMes += (Number(item.lucro_unitario || 0) * item.quantidade)
            if (item.margem_liquida !== null) {
                margemSomada += Number(item.margem_liquida)
                itensComMargemCount++
            }
        })

        const planLimit = 150
        const usagePercentage = Math.min(100, Math.round((countVendasNoMes / planLimit) * 100))

        return {
            estoque: {
                totalProdutos: countProdutos,
                totalIngredientes: countIngredientes,
                // Alertas simplificados para o Dashboard
                alertaBaixo: true // Frontend faz o fetch detalhado se clicar
            },
            comissoes: {
                comissoesDoMes: Number(comissoesMesAggregate._sum.valor || 0),
                comissoesAReceber: Number(comissoesReceberAggregate._sum.valor || 0)
            },
            usage: {
                count: countVendasNoMes,
                limit: planLimit,
                percentage: usagePercentage,
                plan: user?.plan || 'free'
            },
            insights: {
                lucroMes: Number(lucroMes.toFixed(2)),
                margemMedia: Number((itensComMargemCount > 0 ? margemSomada / itensComMargemCount : 0).toFixed(1))
                // Removido lucroPotencial (Processamento pesado movido para relatórios)
            },
            transacoes: {
                totalVendas: Number(vendasAggregate._sum.valor_total || 0),
                totalCompras: Number(comprasAggregate._sum.valor_total || 0),
                totalGastos: Number(gastosAggregate._sum.valor || 0),
                contagens: {
                    vendas: countVendasNoMes,
                    compras: 0, // Simplificado
                    gastos: 0   // Simplificado
                }
            }
        }
    })
}
