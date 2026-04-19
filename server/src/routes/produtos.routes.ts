import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function produtosRoutes(app: FastifyInstance) {
    app.addHook('onRequest', app.authenticate)

    // Listar Produtos
    app.withTypeProvider<ZodTypeProvider>().get('/', {
        schema: {
            querystring: z.object({
                nome: z.string().optional(),
                ativo: z.string().transform(v => v === 'true').optional(),
                limit: z.string().optional(),
                page: z.string().optional(),
            }),
        },
    }, async (request) => {
        const { nome, ativo, limit, page } = request.query
        const take = Math.min(Number(limit) || 50, 100)
        const skip = (Math.max(Number(page) || 1, 1) - 1) * take
        const userId = request.user.sub

        const produtos = await prisma.produto.findMany({
            where: {
                userId,
                nome: nome ? { contains: nome } : undefined,
                ativo: ativo !== undefined ? ativo : undefined,
            },
            orderBy: { nome: 'asc' },
            take,
            skip,
        })

        const total = await prisma.produto.count({ where: { userId, nome: nome ? { contains: nome } : undefined, ativo: ativo !== undefined ? ativo : undefined } })

        return { 
            results: produtos,
            meta: { page: Math.max(Number(page) || 1, 1), limit: take, total, totalPages: Math.ceil(total / take) }
        }
    })

    // Criar Produto
    app.withTypeProvider<ZodTypeProvider>().post('/', {
        schema: {
            body: z.object({
                nome: z.string(),
                preco: z.number(),
                custo: z.number().optional(),
                estoque_atual: z.number().optional(),
                unidade: z.string().default('un'),
                controla_estoque: z.boolean().default(false),
            }),
        },
    }, async (request) => {
        const userId = request.user.sub
        const data = request.body

        const produto = await prisma.produto.create({
            data: {
                ...data,
                userId,
            },
        })
        return produto
    })

    // Atualizar Produto (Com Auditoria de Preço)
    app.withTypeProvider<ZodTypeProvider>().put('/:id', {
        schema: {
            params: z.object({ id: z.string().uuid() }),
            body: z.object({
                nome: z.string().optional(),
                preco: z.number().optional(),
                custo: z.number().optional(),
                estoque_atual: z.number().optional(),
                unidade: z.string().optional(),
                controla_estoque: z.boolean().optional(),
                ativo: z.boolean().optional(),
            }),
        },
    }, async (request, reply) => {
        const { id } = request.params
        const userId = request.user.sub
        const body = request.body

        const oldProduto = await prisma.produto.findFirst({ 
            where: { id, userId },
            include: { user: { select: { taxa_impostos: true, taxa_cartao: true } } }
        })

        if (!oldProduto) return reply.status(404).send()

        const produto = await prisma.produto.update({
            where: { id },
            data: body,
        })

        // Auditoria: Registar se o preço de venda mudou
        if (body.preco !== undefined && Number(body.preco) !== Number(oldProduto.preco)) {
            const taxas = (Number(oldProduto.user?.taxa_impostos || 0) + Number(oldProduto.user?.taxa_cartao || 0)) / 100
            const custo = Number(produto.custo || 0)
            const novoPreco = Number(produto.preco)
            
            const lucroNovo = novoPreco - custo - (novoPreco * taxas)
            const margemNova = (lucroNovo / novoPreco) * 100

            await prisma.historicoPreco.create({
                data: {
                    produtoId: id,
                    userId,
                    precoAnterior: oldProduto.preco,
                    precoNovo: produto.preco,
                    custoMomento: produto.custo || 0,
                    margemMomento: margemNova || 0,
                    origem: "manual" // Pode ser 'automatico' em ações de lote futuras
                }
            })
        }

        return produto
    })

    // Deletar
    app.withTypeProvider<ZodTypeProvider>().delete('/:id', {
        schema: {
            params: z.object({ id: z.string().uuid() }),
        },
    }, async (request, reply) => {
        const { id } = request.params
        const userId = request.user.sub

        const check = await prisma.produto.findFirst({ where: { id, userId } })
        if (!check) return reply.status(404).send()

        await prisma.produto.delete({ where: { id } })
        return reply.status(204).send()
    })
}
