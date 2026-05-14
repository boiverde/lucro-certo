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

    app.withTypeProvider<ZodTypeProvider>().post('/', {
        schema: {
            body: z.object({
                nome: z.string(),
                preco: z.number(),
                custo: z.number().optional(),
                estoque_atual: z.number().optional(),
                estoque_minimo: z.number().optional(),
                unidade: z.string().default('un'),
                controla_estoque: z.boolean().default(true),
                ativo: z.boolean().default(true),
                descricao: z.string().optional(),
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

    // Atualizar Produto (Com Auditoria de Produção v2.2)
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
                margem_prevista: z.number().optional(),
                margem_realizada: z.number().optional(),
                canal: z.string().optional(),
                origem: z.enum(['manual', 'inteligencia']).optional()
            }),
        },
    }, async (request, reply) => {
        const { id } = request.params
        const userId = request.user.sub
        const { margem_prevista, margem_realizada, canal, origem, ...body } = request.body as any

        const oldProduto = await prisma.produto.findFirst({ 
            where: { id, userId },
            include: { user: { select: { taxa_impostos: true, taxa_cartao: true } } }
        })

        if (!oldProduto) return reply.status(404).send({ message: "Produto não encontrado" })

        const produto = await prisma.produto.update({
            where: { id },
            data: body,
        })

        // Auditoria de Produção High Precision v2.2
        if (body.preco !== undefined && Number(body.preco) !== Number(oldProduto.preco)) {
            const taxas = (Number(oldProduto.user?.taxa_impostos || 0) + Number(oldProduto.user?.taxa_cartao || 0)) / 100
            const custo = Number(produto.custo || 0)
            const novoPreco = Number(produto.preco)
            
            const lucroNovo = novoPreco - custo - (novoPreco * taxas)
            const margemNova = novoPreco > 0 ? (lucroNovo / novoPreco) * 100 : 0

            await prisma.historicoPreco.create({
                data: {
                    produtoId: id,
                    userId,
                    precoAnterior: oldProduto.preco,
                    precoNovo: produto.preco,
                    custoMomento: produto.custo || 0,
                    margemMomento: margemNova,
                    margemPrevista: margem_prevista || margemNova,
                    margemRealizada: margem_realizada || 0,
                    canal: canal || "balcao",
                    versaoFormula: "v2.2-adaptive",
                    origem: origem || "manual"
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
