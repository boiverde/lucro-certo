import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { addMonths } from 'date-fns'

export async function revendasRoutes(app: FastifyInstance) {
    app.addHook('onRequest', app.authenticate)

    // --- EMPRESAS --- //

    // Listar Empresas
    app.withTypeProvider<ZodTypeProvider>().get('/empresas', {
        schema: {
            querystring: z.object({
                sort: z.string().optional(),
            }),
        },
    }, async (request) => {
        const userId = request.user.sub
        const empresas = await prisma.empresaRevenda.findMany({
            where: { userId },
            orderBy: { nome: 'asc' }
        })
        return { results: empresas }
    })

    // Criar Empresa
    app.withTypeProvider<ZodTypeProvider>().post('/empresas', {
        schema: {
            body: z.object({
                nome: z.string(),
                porcentagem_comissao: z.number(),
                ativa: z.boolean().optional().default(true),
                cor: z.string().optional()
            }),
        },
    }, async (request) => {
        const userId = request.user.sub
        const data = request.body

        const empresa = await prisma.empresaRevenda.create({
            data: {
                userId,
                ...data
            }
        })
        return empresa
    })

    // Atualizar Empresa
    app.withTypeProvider<ZodTypeProvider>().put('/empresas/:id', {
        schema: {
            params: z.object({ id: z.string().uuid() }),
            body: z.object({
                nome: z.string().optional(),
                porcentagem_comissao: z.number().optional(),
                ativa: z.boolean().optional(),
                cor: z.string().optional()
            }),
        },
    }, async (request) => {
        const { id } = request.params
        const userId = request.user.sub
        const data = request.body

        const empresa = await prisma.empresaRevenda.updateMany({
            where: { id, userId },
            data
        })
        return empresa
    })

    // --- GASTOS --- //

    // Listar Gastos
    app.withTypeProvider<ZodTypeProvider>().get('/gastos', {
        schema: {
            querystring: z.object({
                sort: z.string().optional()
            }),
        },
    }, async (request) => {
        const userId = request.user.sub
        // Ignora sort complexo por enquanto, ordena por data desc
        const gastos = await prisma.gastoRevenda.findMany({
            where: { userId },
            include: { empresa: true },
            orderBy: { data: 'desc' }
        })
        return { results: gastos }
    })

    // Criar Gasto
    app.withTypeProvider<ZodTypeProvider>().post('/gastos', {
        schema: {
            body: z.object({
                descricao: z.string(),
                valor: z.number(),
                data: z.string().datetime().or(z.string()),
                empresaId: z.string().uuid().optional().nullable()
            }),
        },
    }, async (request) => {
        const userId = request.user.sub
        const data = request.body

        const gasto = await prisma.gastoRevenda.create({
            data: {
                userId,
                descricao: data.descricao,
                valor: data.valor,
                data: new Date(data.data),
                empresaId: data.empresaId || null
            }
        })
        return gasto
    })

    // Atualizar Gasto
    app.withTypeProvider<ZodTypeProvider>().put('/gastos/:id', {
        schema: {
            params: z.object({ id: z.string().uuid() }),
            body: z.object({
                descricao: z.string().optional(),
                valor: z.number().optional(),
                data: z.string().datetime().or(z.string()).optional(),
                empresaId: z.string().uuid().optional().nullable()
            }),
        },
    }, async (request) => {
        const { id } = request.params
        const userId = request.user.sub
        const data = request.body

        const updateData: any = { ...data }
        if (data.data) updateData.data = new Date(data.data)

        const gasto = await prisma.gastoRevenda.updateMany({
            where: { id, userId },
            data: updateData
        })
        return gasto
    })

    // Deletar Gasto
    app.withTypeProvider<ZodTypeProvider>().delete('/gastos/:id', {
        schema: { params: z.object({ id: z.string().uuid() }) }
    }, async (request, reply) => {
        const { id } = request.params
        const userId = request.user.sub
        await prisma.gastoRevenda.deleteMany({ where: { id, userId } })
        return reply.status(204).send()
    })

    // --- VENDAS REVENDA --- //

    // Listar Vendas
    app.withTypeProvider<ZodTypeProvider>().get('/vendas', {
        schema: {
            querystring: z.object({
                status: z.string().optional(),
                sort: z.string().optional()
            }),
        },
    }, async (request) => {
        const userId = request.user.sub
        const vendas = await prisma.vendaRevenda.findMany({
            where: { userId },
            include: {
                empresa: true,
                parcelas: true // Precisamos das parcelas para contar pagas
            },
            orderBy: { data_primeira_parcela: 'desc' }
        })

        // Mapear para adicionar campos calculados que o frontend espera
        const results = vendas.map(v => {
            const parcelas_pagas = v.parcelas.filter(p => p.paga).length
            return {
                ...v,
                parcelas_pagas,
                empresa_nome: v.empresa.nome,
                cliente: v.clienteId ? 'Cliente Cadastrado' : (v.descricao_produtos ? v.descricao_produtos.split(' - ')[0] : 'Cliente') // Fallback ruim, mas frontend usa campo 'cliente' que não está claro onde salva (provavelmente no create foi salvo no cliente, ver schema)
                // Revisando schema: VendaRevenda tem clienteId.
                // O frontend envia cliente (string) e cria cliente se nao existe, depois manda id.
            }
        })

        // Precisamos buscar o nome do cliente. Vamos fazer um fetch otimizado?
        // Ou melhor, incluir cliente no findMany.
        const vendasComCliente = await prisma.vendaRevenda.findMany({
            where: { userId },
            include: {
                empresa: true,
                parcelas: true,
                cliente: true
            },
            orderBy: { data_primeira_parcela: 'desc' }
        })

        const resultsFinal = vendasComCliente.map(v => {
            const parcelas_pagas = v.parcelas.filter(p => p.paga).length
            return {
                ...v,
                parcelas_pagas,
                empresa_nome: v.empresa.nome,
                cliente: v.cliente?.nome || 'Cliente Desconhecido'
            }
        })

        return { results: resultsFinal }
    })

    // Criar Venda Revenda
    app.withTypeProvider<ZodTypeProvider>().post('/vendas', {
        schema: {
            body: z.object({
                cliente: z.string().optional(), // Nome do cliente (frontend manda as vezes)
                clienteId: z.string().uuid().optional(), // Ou ID
                empresa_id: z.string().uuid(),
                valor_total: z.number(),
                numero_parcelas: z.number().int().min(1),
                valor_parcela: z.number(),
                porcentagem_comissao: z.number(),
                valor_comissao_total: z.number(),
                data_primeira_parcela: z.string(),
                produto: z.string().optional(), // Descricao produtos
                observacoes: z.string().optional(),
                status: z.string().default('ativa'),
                parcelas_pagas: z.number().optional().default(0) // Frontend manda 0
            }),
        },
    }, async (request) => {
        const userId = request.user.sub
        const data = request.body

        // Se veio nome de cliente e não ID, deveria ter sido tratado no frontend (que cria cliente antes).
        // Vamos confiar que frontend manda clienteId se criou, OU vamos tentar achar cliente pelo nome?
        // O código do frontend (lin 153 de Revendas.jsx): cria o cliente antes, mas no payload da venda manda 'cliente' (nome) e não Id? Ver FormVendaRevenda.
        // O FormVendaRevenda usa dados.cliente (string).
        // Mas o createVendaMutation do Revendas.jsx faz: base44.entities.Cliente.create(...), mas depois chama VendaRevenda.create(data).
        // Ele NÃO injeta o ID do cliente criado no payload 'data' antes de chamar create(data) explicitamente no código que vi.
        // Espere, vamos rever o código do frontend cuidadosamente.
        // mutationFn: async (data) => { ... await Cliente.create ... return VendaRevenda.create(data) }
        // O 'data' passado para create é o ...dados do form, que tem { cliente: "Maria", ... }. Não tem clienteId.

        // Hardening: Remover busca por nome. Exigir ID ou falhar.
        let clienteId = data.clienteId
        if (!clienteId) {
            return reply.status(400).send({ 
                error: 'MISSING_CLIENT_ID', 
                message: 'O ID do cliente é obrigatório para registrar a venda de revenda.' 
            })
        }

        const result = await prisma.$transaction(async (tx) => {
            // Cálculo de Precisão de Centavos (Hardening Financeiro)
            const numeroParcelas = data.numero_parcelas
            const valorTotal = data.valor_total
            const valorParcelaPadrao = data.valor_parcela
            
            // A última parcela assume a diferença para fechar o total exato
            const somaAnteriores = valorParcelaPadrao * (numeroParcelas - 1)
            const valorUltimaParcela = Number((valorTotal - somaAnteriores).toFixed(2))

            const venda = await tx.vendaRevenda.create({
                data: {
                    userId,
                    empresaId: data.empresa_id,
                    clienteId: clienteId,
                    valor_total: valorTotal,
                    numero_parcelas: numeroParcelas,
                    valor_parcela: valorParcelaPadrao,
                    comissao_total: data.valor_comissao_total,
                    data_primeira_parcela: new Date(data.data_primeira_parcela),
                    descricao_produtos: data.produto,
                    status: data.status,
                    parcelas: {
                        create: Array.from({ length: numeroParcelas }).map((_, i) => ({
                            numero: i + 1,
                            data_vencimento: addMonths(new Date(data.data_primeira_parcela), i),
                            valor: (i === numeroParcelas - 1) ? valorUltimaParcela : valorParcelaPadrao,
                            paga: false
                        }))
                    }
                }
            })
            return venda
        })

        return result
    })

    // Atualizar Venda (e Parcelas Paga)
    app.withTypeProvider<ZodTypeProvider>().put('/vendas/:id', {
        schema: {
            params: z.object({ id: z.string().uuid() }),
            body: z.object({
                parcelas_pagas: z.number().optional(),
                status: z.string().optional(),
                // Outros campos update...
                valor_total: z.number().optional(),
                observacoes: z.string().optional(),
                // etc (MVP foca no parcelas_pagas que é o mais complexo)
            }).passthrough(), // permite outros campos
        },
    }, async (request) => {
        const { id } = request.params
        const userId = request.user.sub
        const data = request.body

        const result = await prisma.$transaction(async (tx) => {
            // Atualiza dados básicos
            const updated = await tx.vendaRevenda.update({
                where: { id, userId },
                data: {
                    status: data.status,
                    valor_total: data.valor_total, // se vier
                    // mapear outros campos se necessário
                }
            })

            // Se veio parcelas_pagas, atualizar as parcelas filhas
            if (typeof data.parcelas_pagas === 'number') {
                // Buscar parcelas ordenadas por numero
                const parcelas = await tx.parcelaRevenda.findMany({
                    where: { vendaRevendaId: id },
                    orderBy: { numero: 'asc' }
                })

                const qtdPagas = data.parcelas_pagas

                // Marcar as primeiras X como pagas, restante pendente (caso user desmarque)
                const promises = parcelas.map((p, index) => {
                    const deveEstarPaga = index < qtdPagas
                    if (p.paga !== deveEstarPaga) {
                        return tx.parcelaRevenda.update({
                            where: { id: p.id },
                            data: {
                                paga: deveEstarPaga,
                                data_pagamento: deveEstarPaga ? new Date() : null
                            }
                        })
                    }
                    return Promise.resolve()
                })
                await Promise.all(promises)
            }

            return updated
        })

        return result
    })

    // Deletar Venda
    app.withTypeProvider<ZodTypeProvider>().delete('/vendas/:id', {
        schema: { params: z.object({ id: z.string().uuid() }) }
    }, async (request, reply) => {
        const { id } = request.params
        const userId = request.user.sub
        await prisma.vendaRevenda.deleteMany({ where: { id, userId } })
        return reply.status(204).send()
    })
}
