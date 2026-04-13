import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function adminRoutes(app: FastifyInstance) {
    // Buscar usuário por email
    app.withTypeProvider<ZodTypeProvider>().get('/users/search', {
        onRequest: [app.authenticate],
        schema: {
            querystring: z.object({
                email: z.string().email(),
            }),
        },
    }, async (request, reply) => {
        // Validação de Admin (simplificada por email conforme check_admin.ts)
        const adminEmail = 'admin@lucrocerto.com';
        const currentUser = await prisma.user.findUnique({
            where: { id: (request.user as any).sub }
        });

        if (!currentUser || currentUser.email !== adminEmail) {
            return reply.status(403).send({ message: 'Acesso negado. Apenas administradores podem realizar esta busca.' });
        }

        const { email } = request.query;

        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                name: true,
                email: true,
                plan: true,
            }
        });

        if (!user) {
            return reply.status(404).send({ message: 'Usuário não encontrado.' });
        }

        return user;
    });

    // Alterar plano do usuário
    app.withTypeProvider<ZodTypeProvider>().patch('/users/:id/plan', {
        onRequest: [app.authenticate],
        schema: {
            params: z.object({
                id: z.string().uuid(),
            }),
            body: z.object({
                plan: z.enum(['free', 'pro']),
            }),
        },
    }, async (request, reply) => {
        const adminEmail = 'admin@lucrocerto.com';
        const currentUser = await prisma.user.findUnique({
            where: { id: (request.user as any).sub }
        });

        if (!currentUser || currentUser.email !== adminEmail) {
            return reply.status(403).send({ message: 'Acesso negado. Apenas administradores podem alterar planos.' });
        }

        const { id } = request.params;
        const { plan } = request.body;

        const targetUser = await prisma.user.findUnique({
            where: { id }
        });

        if (!targetUser) {
            return reply.status(404).send({ message: 'Usuário não encontrado.' });
        }

        const oldPlan = targetUser.plan;

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { plan },
        });

        // Auditoria
        console.log(`[ADMIN AUDIT] Plan Changed | Admin: ${currentUser.email} | Target: ${targetUser.email} (${id}) | From: ${oldPlan} | To: ${plan} | Time: ${new Date().toISOString()}`);

        return reply.send({ 
            message: `Plano do usuário ${targetUser.email} alterado para ${plan} com sucesso.`,
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                plan: updatedUser.plan
            }
        });
    });
}
