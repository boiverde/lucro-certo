import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { addMonths } from 'date-fns'

export async function dashboardRoutes(app: FastifyInstance) {
    app.addHook('onRequest', app.authenticate)

    app.get('/stats', async (request, reply) => {
        const userId = request.user.sub
        const hoje = new Date()
        const startOfMonth = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
        const endOfMonth = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59, 999)

        // Rodando todas as consultas em paralelo para máxima velocidade
        const [
            user,
            totalProdutos,
            produtosComControle,
            totalIngredientes,
            ingredientesComAlerta,
            vendasRevenda,
            salesCount,
            vendasNoMes,
            comprasNoMes,
            gastosNoMes
        ] = await Promise.all([
            prisma.user.findUnique({ where: { id: userId }, select: { plan: true } }),
            prisma.produto.count({ where: { userId, ativo: true } }),
            prisma.produto.findMany({
                where: { userId, ativo: true, controla_estoque: true },
                select: { estoque_atual: true, estoque_minimo: true }
            }),
            prisma.ingrediente.count({ where: { userId, ativo: true } }),
            prisma.ingrediente.findMany({
                where: { userId, ativo: true, estoque_minimo: { gt: 0 } },
                select: { estoque_atual: true, estoque_minimo: true }
            }),
            prisma.vendaRevenda.findMany({
                where: { userId, status: { not: 'cancelada' } },
                select: {
                    status: true,
                    numero_parcelas: true,
                    comissao_total: true,
                    data_primeira_parcela: true,
                    parcelas: { select: { paga: true } }
                }
            }),
            prisma.venda.count({
                where: { userId, createdAt: { gte: startOfMonth, lte: endOfMonth } }
            }),
            prisma.venda.findMany({
                where: { userId, data_venda: { gte: startOfMonth, lte: endOfMonth } },
                select: { itens: { select: { lucro_unitario: true, quantidade: true, margem_liquida: true, taxas_aplicadas: true, custo_total_unitario: true } } }
            }),
            prisma.compra.findMany({
                where: { userId, data_compra: { gte: startOfMonth, lte: endOfMonth } },
                select: { valor_total: true }
            }),
            prisma.gastoOperacional.findMany({
                where: { userId, data: { gte: startOfMonth, lte: endOfMonth } },
                select: { valor: true, tipo: true }
            })
        ])

        // Processamento de Estoque mais eficiente
        const produtosBaixos = produtosComControle.filter(p => p.estoque_atual <= p.estoque_minimo && p.estoque_minimo > 0 && p.estoque_atual > 0).length
        const produtosZerados = produtosComControle.filter(p => p.estoque_atual === 0).length
        const ingredientesBaixos = ingredientesComAlerta.filter(i => i.estoque_atual <= i.estoque_minimo).length

        // Processamento de Comissões
        let comissoesDoMes = 0
        let comissoesAReceber = 0
        const inicioMesObj = startOfMonth
        const fimMesObj = endOfMonth

        vendasRevenda.forEach(venda => {
            if (!venda.numero_parcelas) return;
            const parcelasPagas = venda.parcelas.filter(p => p.paga).length
            const comissaoPorParcela = Number(venda.comissao_total) / venda.numero_parcelas

            for (let i = 0; i < parcelasPagas; i++) {
                const dataParcela = addMonths(venda.data_primeira_parcela, i)
                if (dataParcela >= inicioMesObj && dataParcela <= fimMesObj) {
                    comissoesDoMes += comissaoPorParcela
                }
            }

            if (venda.status !== 'paga') {
                const parcelasRestantes = venda.numero_parcelas - parcelasPagas
                comissoesAReceber += (parcelasRestantes * comissaoPorParcela)
            }
        })
        
        const planLimit = 150
        const usagePercentage = Math.min(100, Math.round((salesCount / planLimit) * 100))

        // Lucratividade (Processando apenas os campos necessários)
        let lucroMes = 0
        let margemSomada = 0
        let itensComMargemCount = 0
        let lucroPotencial = 0

        vendasNoMes.forEach(venda => {
            venda.itens.forEach(item => {
                const lucro = Number(item.lucro_unitario || 0) * item.quantidade
                lucroMes += lucro

                if (item.margem_liquida !== null) {
                    margemSomada += Number(item.margem_liquida)
                    itensComMargemCount++
                }

                const taxas = Number(item.taxas_aplicadas) || 0
                const custoTotal = Number(item.custo_total_unitario) || 0
                if (taxas > 0 && custoTotal > 0) {
                    const divisor = 1 - (taxas + 0.30)
                    if (divisor > 0) {
                        const precoIdeal = custoTotal / divisor
                        const lucroIdeal = (precoIdeal - custoTotal - (precoIdeal * taxas)) * item.quantidade
                        if (lucroIdeal > lucro) lucroPotencial += (lucroIdeal - lucro)
                    }
                }
            })
        })

        return {
            estoque: {
                totalProdutos,
                totalIngredientes,
                produtosBaixos,
                produtosZerados,
                ingredientesBaixos
            },
            comissoes: {
                comissoesDoMes,
                comissoesAReceber
            },
            usage: {
                count: salesCount,
                limit: planLimit,
                percentage: usagePercentage,
                plan: user?.plan || 'free'
            },
            insights: {
                lucroMes: Number(lucroMes.toFixed(2)),
                margemMedia: Number((itensComMargemCount > 0 ? margemSomada / itensComMargemCount : 0).toFixed(1)),
                lucroPotencial: Number(lucroPotencial.toFixed(2))
            },
            // Dados brutos simplificados para evitar queries extras no front
            transacoes: {
                totalVendas: vendasNoMes.reduce((sum, v) => sum + v.itens.reduce((s, i) => s + (Number(i.lucro_unitario || 0) + Number(i.custo_total_unitario || 0)) * i.quantidade, 0), 0),
                totalCompras: comprasNoMes.reduce((sum, c) => sum + Number(c.valor_total || 0), 0),
                totalGastos: gastosNoMes.reduce((sum, g) => sum + Number(g.valor || 0), 0),
                contagens: {
                    vendas: vendasNoMes.length,
                    compras: comprasNoMes.length,
                    gastos: gastosNoMes.length
                },
                detalhesGastos: {
                    alimentacao: gastosNoMes.filter(g => g.tipo === 'alimentacao').reduce((sum, g) => sum + Number(g.valor || 0), 0),
                    gasolina: gastosNoMes.filter(g => g.tipo === 'gasolina').reduce((sum, g) => sum + Number(g.valor || 0), 0),
                    diarias: gastosNoMes.filter(g => g.tipo === 'diaria_funcionario').reduce((sum, g) => sum + Number(g.valor || 0), 0)
                },
                // Listas recentes para os componentes do dashboard
                recentes: {
                    vendas: vendasNoMes.slice(0, 10),
                    compras: comprasNoMes.slice(0, 10),
                    gastos: gastosNoMes.slice(0, 10)
                }
            }
        }
    })
}
