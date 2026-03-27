import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function producoesRoutes(app: FastifyInstance) {
    app.addHook('onRequest', app.authenticate)

    // Listar
    app.withTypeProvider<ZodTypeProvider>().get('/', {
        schema: {
            querystring: z.object({
                 data_inicio: z.string().optional(),
                 data_fim: z.string().optional(),
            }),
        },
    }, async (request) => {
        const { data_inicio, data_fim } = request.query
        const userId = request.user.sub

        const where: any = { userId }
        if (data_inicio) {
             where.data_producao = {
                 gte: new Date(data_inicio),
                 lte: data_fim ? new Date(data_fim) : undefined,
             }
        }

        const producoes = await prisma.producaoLanche.findMany({
            where,
            include: { receita: true },
            orderBy: { data_producao: 'desc' },
        })

        return { results: producoes }
    })

    // Criar Producao
    app.withTypeProvider<ZodTypeProvider>().post('/', {
        schema: {
            body: z.object({
                receita_id: z.string().uuid(),
                quantidade: z.number(),
                data_producao: z.string().datetime().or(z.string()),
                observacoes: z.string().optional(),
                custo_total: z.number().optional().default(0),
                salvar_estoque: z.boolean().optional().default(false), // Adicionar direto ao estoque do Produto?
            }),
        },
    }, async (request, reply) => {
        const userId = request.user.sub
        const data = request.body

        // 1. Validar receita existe e tem ingredientes
        const receita = await prisma.receitaProduto.findFirst({
             where: { id: data.receita_id, userId },
             include: { ingredientes: true }
        })

        if (!receita) return reply.status(404).send({ message: "Receita não encontrada" })

        const result = await prisma.$transaction(async (tx) => {
              // 2. Descontar estoque de ingredientes
              for (const item of receita.ingredientes) {
                   const qtdBaixar = item.quantidade_kg * data.quantidade; // Quanto gasta por receita * Qtd feita
                   await tx.ingrediente.update({
                       where: { id: item.ingredienteId },
                       data: { estoque_atual: { decrement: qtdBaixar } }
                   })
                   // Pode logar em movimentacao de ingrediente se quiser. No MVP, so decrementamos.
              }

              // 3. Criar log de producao
              const producao = await tx.producaoLanche.create({
                  data: {
                      userId,
                      receitaId: receita.id,
                      quantidade_produzida: data.quantidade,
                      data_producao: new Date(data.data_producao),
                      custo_total_producao: data.custo_total,
                      observacoes: data.observacoes,
                  }
              })

              return producao
        })

        return reply.status(201).send(result)
    })

    // Deletar Producao (Estorna estoque de ingredientes)
    app.withTypeProvider<ZodTypeProvider>().delete('/:id', {
        schema: { params: z.object({ id: z.string().uuid() }) }
    }, async (request, reply) => {
        const { id } = request.params
        const userId = request.user.sub

        const producao = await prisma.producaoLanche.findFirst({
            where: { id, userId },
            include: { receita: { include: { ingredientes: true } } }
        })

        if (!producao) return reply.status(404).send()

        await prisma.$transaction(async (tx) => {
             // Estornar ingredientes devolvendo ao estoque
             if (producao.receita && producao.receita.ingredientes) {
                 for(const item of producao.receita.ingredientes) {
                     const qtdEstornar = item.quantidade_kg * producao.quantidade_produzida;
                     await tx.ingrediente.update({
                         where: { id: item.ingredienteId },
                         data: { estoque_atual: { increment: qtdEstornar } }
                     })
                 }
             }

             // Deletar a producao
             await tx.producaoLanche.delete({ where: { id } })
        })

        return reply.status(204).send()
    })
}
