import fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import formbody from '@fastify/formbody'
import { validatorCompiler, serializerCompiler, ZodTypeProvider } from 'fastify-type-provider-zod'
import { authRoutes } from './routes/auth.routes'
import { clientesRoutes } from './routes/clientes.routes'
import { produtosRoutes } from './routes/produtos.routes'
import { vendasRoutes } from './routes/vendas.routes'
import { comprasRoutes } from './routes/compras.routes'
import { movimentacoesRoutes } from './routes/movimentacoes.routes'
import fastifyMultipart from '@fastify/multipart'
import { revendasRoutes } from './routes/revendas.routes'
import { uploadRoutes } from './routes/upload.routes'
import { dashboardRoutes } from './routes/dashboard.routes'
import { gastosPessoaisRoutes } from './routes/gastos-pessoais.routes'
import { gastosOperacionaisRoutes } from './routes/gastos-operacionais.routes'
import { ingredientesRoutes } from './routes/ingredientes.routes'
import { receitasRoutes } from './routes/receitas.routes'
import { producoesRoutes } from './routes/producoes.routes'
import { lotesRoutes } from './routes/lotes.routes'
import { alertasRoutes } from './routes/alertas.routes'
import { fornecedoresRoutes } from './routes/fornecedores.routes'
import { pedidosRoutes } from './routes/pedidos.routes'
import { funcionariosRoutes } from './routes/funcionarios.routes'
import { diariasRoutes } from './routes/diarias.routes'
import { adminRoutes } from './routes/admin.routes'
import { paymentsRoutes } from './routes/payments.routes'
import { analyticsRoutes } from './routes/analytics.routes'
import { reportsRoutes } from './routes/reports.routes'

export const app = fastify().withTypeProvider<ZodTypeProvider>()

// Configuração Zod
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

// Plugins
app.register(fastifyMultipart)
app.register(formbody) // Suporte para Webhook do PagSeguro (x-www-form-urlencoded)

const jwtSecret = process.env.JWT_SECRET
if (!jwtSecret) {
    throw new Error('FATAL: JWT_SECRET não definido. Defina a variável de ambiente antes de iniciar o servidor.')
}

app.register(cors, {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
})

app.register(jwt, {
    secret: jwtSecret,
})

// Decorator de Auth
app.decorate('authenticate', async (request: any, reply: any) => {
    try {
        await request.jwtVerify()
    } catch (err) {
        throw err // Joga para o organizador global de erro
    }
})

// Manipulador Global de Erros (Padronização)
app.setErrorHandler((error: any, request, reply) => {
    // 1. Zod / Validation Fastify
    if (error.validation) {
        return reply.status(400).send({
            error: 'VALIDATION_ERROR',
            message: 'Os dados informados não são válidos.',
            details: error.validation,
            statusCode: 400
        });
    }

    // 2. JWT & Autenticação
    const authErrors = [
        'FST_JWT_NO_AUTHORIZATION_IN_HEADER', 
        'FST_JWT_AUTHORIZATION_TOKEN_EXPIRED', 
        'FST_JWT_AUTHORIZATION_TOKEN_INVALID',
        'FST_JWT_BAD_REQUEST'
    ];
    if (authErrors.includes(error.code)) {
        return reply.status(401).send({
             error: 'UNAUTHORIZED',
             message: 'Acesso negado: Token JWT ausente, inválido ou expirado.',
             statusCode: 401
        });
    }

    // 3. Regra de Negócio (Lançada com statusCode / Custom)
    if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
        return reply.status(error.statusCode).send({
            error: error.code || 'BAD_REQUEST',
            message: error.message,
            statusCode: error.statusCode
        });
    }

    // 4. Prisma KnownRequestErrors (Caches comuns)
    if (error.code && typeof error.code === 'string' && error.code.startsWith('P')) {
        if (error.code === 'P2002') {
             return reply.status(409).send({
                 error: 'CONFLICT',
                 message: 'O registro violou uma restrição de unicidade (já existe).',
                 statusCode: 409
             });
        }
        if (error.code === 'P2003') {
             return reply.status(409).send({
                 error: 'FOREIGN_KEY_CONSTRAINT_FAILED',
                 message: 'Não é possível excluir devido a registros vinculados a ele.',
                 statusCode: 409
             });
        }
        if (error.code === 'P2025') {
            return reply.status(404).send({
                error: 'NOT_FOUND',
                message: 'Registro não encontrado para a operação.',
                statusCode: 404
            });
        }
    }

    // 5. Erro Sistêmico (Vazamento, Servidor, Queda)
    console.error(`[ERROR DETECTED] ${request.method} ${request.url} - ${error.message}`);
    // console.error(error); // Logger estruturado no servidor

    return reply.status(500).send({
        error: 'INTERNAL_SERVER_ERROR',
        message: error.message,
        details: error,
        statusCode: 500
    });
});

// Rotas
app.register(authRoutes, { prefix: '/auth' })
app.register(clientesRoutes, { prefix: '/clientes' })
app.register(produtosRoutes, { prefix: '/produtos' })
app.register(vendasRoutes, { prefix: '/vendas' })
app.register(comprasRoutes, { prefix: '/compras' })
app.register(movimentacoesRoutes, { prefix: '/movimentacoes-estoque' })
app.register(revendasRoutes, { prefix: '/revendas' })
app.register(dashboardRoutes, { prefix: '/dashboard' })
app.register(uploadRoutes, { prefix: '/uploads' })
app.register(gastosPessoaisRoutes, { prefix: '/gastos-pessoais' })
app.register(gastosOperacionaisRoutes, { prefix: '/gastos-operacionais' })
app.register(ingredientesRoutes, { prefix: '/ingredientes' })
app.register(receitasRoutes, { prefix: '/receitas' })
app.register(producoesRoutes, { prefix: '/producoes' })
app.register(lotesRoutes, { prefix: '/lotes' })
app.register(alertasRoutes, { prefix: '/alertas' })
app.register(fornecedoresRoutes, { prefix: '/fornecedores' })
app.register(pedidosRoutes, { prefix: '/pedidos' })
app.register(funcionariosRoutes, { prefix: '/funcionarios' })
app.register(diariasRoutes, { prefix: '/diarias' })
app.register(adminRoutes, { prefix: '/admin' })
app.register(paymentsRoutes, { prefix: '/payments' })
app.register(analyticsRoutes, { prefix: '/analytics' })
app.register(reportsRoutes, { prefix: '/reports' })

app.get('/health', async () => {
    try {
        // Teste de pulsação do banco de dados
        await prisma.$queryRaw`SELECT 1`
        return { 
            status: 'ok', 
            server: 'fastify', 
            db: 'connected',
            timestamp: new Date().toISOString()
        }
    } catch (error: any) {
        return { 
            status: 'degraded', 
            server: 'fastify', 
            db: 'failed',
            error: error.message,
            timestamp: new Date().toISOString() 
        }
    }
})
