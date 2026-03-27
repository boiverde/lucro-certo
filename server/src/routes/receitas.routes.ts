import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function receitasRoutes(app: FastifyInstance) {
    app.addHook('onRequest', app.authenticate)

    // Listar Receitas
    app.withTypeProvider<ZodTypeProvider>().get('/', {
        schema: {
            querystring: z.object({
                categoria: z.string().optional(),
            }),
        },
    }, async (request) => {
        const { categoria } = request.query
        const userId = request.user.sub

        const where: any = { userId }
        if (categoria) where.categoria = categoria

        const receitas = await prisma.receitaProduto.findMany({
            where,
            include: { ingredientes: true },
            orderBy: { nome_produto: 'asc' },
        })

        return { results: receitas }
    })

    // Detalhe
    app.withTypeProvider<ZodTypeProvider>().get('/:id', {
        schema: {
            params: z.object({ id: z.string().uuid() })
        }
    }, async (request, reply) => {
        const { id } = request.params
        const userId = request.user.sub

        const receita = await prisma.receitaProduto.findFirst({
            where: { id, userId },
            include: { ingredientes: true }
        })

        if (!receita) return reply.status(404).send()
        return receita
    })

    // Criar Receita
    app.withTypeProvider<ZodTypeProvider>().post('/', {
        schema: {
            body: z.object({
                nome_produto: z.string(),
                categoria: z.string(),
                tempo_preparo: z.number().optional().default(0),
                custo_total: z.number(),
                preco_venda_sugerido: z.number(),
                margem_lucro: z.number(),
                observacoes: z.string().optional(),
                ativo: z.boolean().optional().default(true),
                ingredientes: z.array(z.object({
                    ingrediente_id: z.string().uuid(),
                    ingrediente_nome: z.string().optional(),
                    quantidade: z.number(),
                    quantidade_kg: z.number().optional(),
                    unidade: z.string()
                }))
            }),
        },
    }, async (request, reply) => {
        const userId = request.user.sub
        const data = request.body

        const receita = await prisma.receitaProduto.create({
            data: {
                userId,
                nome_produto: data.nome_produto,
                categoria: data.categoria,
                tempo_preparo: data.tempo_preparo,
                custo_total: data.custo_total,
                preco_venda_sugerido: data.preco_venda_sugerido,
                margem_lucro: data.margem_lucro,
                observacoes: data.observacoes,
                ativo: data.ativo,
                ingredientes: {
                    create: data.ingredientes.map(i => ({
                        ingredienteId: i.ingrediente_id,
                        ingrediente_nome: i.ingrediente_nome,
                        quantidade: i.quantidade,
                        quantidade_kg: i.quantidade_kg || i.quantidade,
                        unidade: i.unidade
                    }))
                }
            },
            include: { ingredientes: true }
        })

        return reply.status(201).send(receita)
    })

    // Atualizar Receita
    app.withTypeProvider<ZodTypeProvider>().put('/:id', {
        schema: {
            params: z.object({ id: z.string().uuid() }),
            body: z.object({
                nome_produto: z.string().optional(),
                categoria: z.string().optional(),
                tempo_preparo: z.number().optional(),
                custo_total: z.number().optional(),
                preco_venda_sugerido: z.number().optional(),
                margem_lucro: z.number().optional(),
                observacoes: z.string().optional(),
                ativo: z.boolean().optional(),
                ingredientes: z.array(z.object({
                    ingrediente_id: z.string().uuid(),
                    ingrediente_nome: z.string().optional(),
                    quantidade: z.number(),
                    quantidade_kg: z.number().optional(),
                    unidade: z.string()
                })).optional()
            }),
        }
    }, async (request, reply) => {
        const { id } = request.params
        const userId = request.user.sub
        const data = request.body

        // Confirmar acesso
        const exists = await prisma.receitaProduto.findFirst({ where: { id, userId } })
        if (!exists) return reply.status(404).send()

        const result = await prisma.$transaction(async (tx) => {
            // Se enviar ingredientes, limpa os velhos e recria
            if (data.ingredientes) {
                await tx.receitaIngrediente.deleteMany({ where: { receitaId: id } })
                
                await tx.receitaProduto.update({
                    where: { id },
                    data: {
                        nome_produto: data.nome_produto,
                        categoria: data.categoria,
                        tempo_preparo: data.tempo_preparo,
                        custo_total: data.custo_total,
                        preco_venda_sugerido: data.preco_venda_sugerido,
                        margem_lucro: data.margem_lucro,
                        observacoes: data.observacoes,
                        ativo: data.ativo,
                        ingredientes: {
                            create: data.ingredientes.map(i => ({
                                ingredienteId: i.ingrediente_id,
                                ingrediente_nome: i.ingrediente_nome,
                                quantidade: i.quantidade,
                                quantidade_kg: i.quantidade_kg || i.quantidade,
                                unidade: i.unidade
                            }))
                        }
                    }
                })
            } else {
                // Atualiza sem mexer nos ingredientes
                await tx.receitaProduto.update({
                    where: { id },
                    data: {
                        nome_produto: data.nome_produto,
                        categoria: data.categoria,
                        tempo_preparo: data.tempo_preparo,
                        custo_total: data.custo_total,
                        preco_venda_sugerido: data.preco_venda_sugerido,
                        margem_lucro: data.margem_lucro,
                        observacoes: data.observacoes,
                        ativo: data.ativo,
                    }
                })
            }
            return true;
        })

        return reply.status(200).send()
    })

    // Deletar
    app.withTypeProvider<ZodTypeProvider>().delete('/:id', {
        schema: { params: z.object({ id: z.string().uuid() }) }
    }, async (request, reply) => {
        const { id } = request.params
        const userId = request.user.sub

        await prisma.receitaProduto.deleteMany({ where: { id, userId } })
        return reply.status(204).send()
    })
}
