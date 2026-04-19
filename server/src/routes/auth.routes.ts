import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

export async function authRoutes(app: FastifyInstance) {
    // Login
    app.withTypeProvider<ZodTypeProvider>().post('/login', {
        schema: {
            body: z.object({
                email: z.string().email(),
                password: z.string(),
            }),
        },
    }, async (request, reply) => {
        const { email, password } = request.body

        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, name: true, email: true, password_hash: true }
        })

        if (!user) {
            return reply.status(400).send({ message: 'Credenciais inválidas.' })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash)

        if (!isPasswordValid) {
            return reply.status(400).send({ message: 'Credenciais inválidas.' })
        }

        const token = app.jwt.sign(
            { name: user.name, email: user.email },
            { sub: user.id, expiresIn: '7d' }
        )

        return reply.send({ token })
    })

    // Register (opcional por enquanto, mas útil)
    app.withTypeProvider<ZodTypeProvider>().post('/register', {
        schema: {
            body: z.object({
                name: z.string(),
                email: z.string().email(),
                password: z.string().min(6),
                utm_source: z.string().optional(),
                utm_medium: z.string().optional(),
                utm_campaign: z.string().optional(),
            }),
        },
    }, async (request, reply) => {
        const { name, email, password, utm_source, utm_medium, utm_campaign } = request.body

        const userExists = await prisma.user.findUnique({
            where: { email },
        })

        if (userExists) {
            return reply.status(400).send({ message: 'Email já cadastrado.' })
        }

        const password_hash = await bcrypt.hash(password, 6)

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password_hash,
                // Aqui você pode adicionar campos ao User no futuro se quiser salvar UTMs
                // Por enquanto o backend de analytics já lida com os eventos.
            },
        })

        // Registrar evento de registro com UTM
        await prisma.analyticsEvent.create({
            data: {
                userId: user.id,
                event: 'user_registered',
                origin: utm_source || 'organic',
                metadata: { utm_medium, utm_campaign }
            }
        });

        return reply.status(201).send({ id: user.id, email: user.email })
    })

    // Login com Google via Supabase Auth
    app.withTypeProvider<ZodTypeProvider>().post('/google', {
        schema: {
            body: z.object({
                token: z.string(), // Access Token do Supabase
            }),
        },
    }, async (request, reply) => {
        const { token } = request.body

        // Ideal é ler as chaves de process.env, usando dummy fallback temporário
        const supabaseUrl = process.env.SUPABASE_URL || 'https://qfahagyxugfjzrigkmkp.supabase.co';
        const supabaseKey = process.env.SUPABASE_ANON_KEY || 'SUBNSTITUA_PELA_SUA_ANON_KEY';
        
        const { createClient } = require('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseKey);

        try {
            const { data: { user: sbUser }, error } = await supabase.auth.getUser(token);

            if (error || !sbUser) {
                console.error('[Auth] Supabase Auth Error:', error);
                return reply.status(401).send({ message: 'Token Google inválido ou expirado.' });
            }

            // Buscar usuário local ou criar
            let userLocal = await prisma.user.findUnique({
                where: { email: sbUser.email },
                select: { id: true, name: true, email: true }
            })

            if (!userLocal) {
                console.log('[Auth] Criando novo usuário via Google:', sbUser.email);
                const crypto = require('crypto');
                const randomPassword = crypto.randomUUID();
                const password_hash = await bcrypt.hash(randomPassword, 6);
                
                userLocal = await prisma.user.create({
                    data: {
                        name: sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || 'Nome não informado',
                        email: sbUser.email!,
                        password_hash,
                    },
                });
            }

            // Emitir o JWT próprio e inquebrável da aplicação
            const localToken = app.jwt.sign(
                { name: userLocal.name, email: userLocal.email },
                { sub: userLocal.id, expiresIn: '7d' }
            )

            console.log('[Auth] Login Google bem-sucedido para:', userLocal.email);
            return reply.send({ token: localToken, email: userLocal.email });
        } catch (err: any) {
            console.error('[Auth] Erro crítico no Login Google:', err.message);
            return reply.status(500).send({ message: 'Erro ao processar login com Google.', details: err.message });
        }
    })

    // Atualizar Perfil / Configurações Financeiras (Hardening de Precisão)
    app.withTypeProvider<ZodTypeProvider>().patch('/me', {
        onRequest: [(app as any).authenticate],
        schema: {
            body: z.object({
                name: z.string().optional(),
                taxa_impostos: z.number().optional(),
                taxa_cartao: z.number().optional(),
                custo_fixo_por_unidade: z.number().optional(),
                margem_lucro_padrao: z.number().optional(),
            })
        }
    }, async (request) => {
        const userId = (request.user as any).sub
        const data = request.body

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                name: data.name,
                taxa_impostos: data.taxa_impostos,
                taxa_cartao: data.taxa_cartao,
                custo_fixo_por_unidade: data.custo_fixo_por_unidade,
                margem_lucro_padrao: data.margem_lucro_padrao
            },
            select: {
                id: true,
                name: true,
                email: true,
                plan: true,
                taxa_impostos: true,
                taxa_cartao: true,
                custo_fixo_por_unidade: true,
                margem_lucro_padrao: true
            }
        })

        return user
    })
    
    // Obter Dados do Usuário (Identidade)
    app.get('/me', {
        onRequest: [(app as any).authenticate]
    }, async (request) => {
        const userId = (request.user as any).sub
        
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                plan: true
            }
        })

        if (!user) return reply.status(404).send({ message: "Usuário não encontrado" })

        return user
    })
}
