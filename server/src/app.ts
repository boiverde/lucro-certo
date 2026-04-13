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

export const app = fastify().withTypeProvider<ZodTypeProvider>()

// Configuração Zod
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

// Plugins
app.register(fastifyMultipart)
app.register(formbody) // Suporte para Webhook do PagSeguro (x-www-form-urlencoded)

app.register(cors, {
    origin: '*',
})

app.register(jwt, {
    secret: process.env.JWT_SECRET || 'supersecret',
})

// Decorator de Auth
app.decorate('authenticate', async (request: any, reply: any) => {
    try {
        await request.jwtVerify()
    } catch (err) {
        reply.send(err)
    }
})

// Rotas
app.register(authRoutes, { prefix: '/auth' })
app.register(clientesRoutes, { prefix: '/clientes' })
app.register(produtosRoutes, { prefix: '/produtos' })
app.register(vendasRoutes, { prefix: '/vendas' })
app.register(comprasRoutes, { prefix: '/compras' })
app.register(movimentacoesRoutes, { prefix: '/movimentacoes-estoque' })
app.register(revendasRoutes, { prefix: '/revendas' })
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

app.get('/health', async () => {
    return { status: 'ok', server: 'fastify', db: 'postgres' }
})
