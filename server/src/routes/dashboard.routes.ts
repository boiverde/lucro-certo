import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { addMonths } from 'date-fns'

export async function dashboardRoutes(app: FastifyInstance) {
    app.addHook('onRequest', app.authenticate)

    app.get('/stats', async (request, reply) => {
        const userId = request.user.sub
        
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { plan: true }
        })

        // 1. Produtos
        const totalProdutos = await prisma.produto.count({ where: { userId, ativo: true } })
        const produtosComControle = await prisma.produto.findMany({
            where: {
                userId,
                ativo: true,
                controla_estoque: true,
            },
            select: { id: true, nome: true, estoque_atual: true, estoque_minimo: true, unidade: true }
        })
        
        const produtosBaixos = produtosComControle.filter(p => p.estoque_atual <= p.estoque_minimo && p.estoque_minimo > 0 && p.estoque_atual > 0)
        const produtosZerados = produtosComControle.filter(p => p.estoque_atual === 0)
        
        // 2. Ingredientes
        const totalIngredientes = await prisma.ingrediente.count({ where: { userId, ativo: true } })
        const ingredientesComAlerta = await prisma.ingrediente.findMany({
            where: {
                userId,
                ativo: true,
                estoque_minimo: { gt: 0 },
            },
            select: { id: true, nome: true, estoque_atual: true, estoque_minimo: true }
        })
        const ingredientesBaixos = ingredientesComAlerta.filter(i => i.estoque_atual <= i.estoque_minimo)

        // 3. Comissões Vendas Revenda
        const vendasRevenda = await prisma.vendaRevenda.findMany({
            where: { userId, status: { not: 'cancelada' } }, 
            select: {
                status: true,
                numero_parcelas: true,
                comissao_total: true,
                data_primeira_parcela: true,
                parcelas: { select: { paga: true } }
            }
        })
        
        const hoje = new Date()
        const inicioMesObj = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
        const fimMesObj = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59, 999)

        let comissoesDoMes = 0
        let comissoesAReceber = 0

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
        
        // 4. Uso do Plano (Vendas no mês para Barra de Progresso)
        const startOfMonth = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
        const endOfMonth = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59, 999)
        
        const salesCount = await prisma.venda.count({
            where: {
                userId,
                createdAt: {
                    gte: startOfMonth,
                    lte: endOfMonth
                }
            }
        })
        
        const planLimit = 150
        const usagePercentage = Math.min(100, Math.round((salesCount / planLimit) * 100))

        // 5. Lucratividade
        const vendasNoMes = await prisma.venda.findMany({
            where: {
                userId,
                data_venda: { gte: startOfMonth, lte: endOfMonth }
            },
            include: { itens: true }
        })

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

                // Cálculo simples do potencial de ganho (benchmark 30%)
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
            }
        }
    })
}
