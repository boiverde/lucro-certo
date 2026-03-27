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
            }),
        },
    }, async (request, reply) => {
        const { name, email, password } = request.body

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
            },
        })

        return reply.status(201).send({ id: user.id, email: user.email })
    })

    // Me
    app.withTypeProvider<ZodTypeProvider>().get('/me', {
        onRequest: [app.authenticate]
    }, async (request) => {
        const user = await prisma.user.findUnique({
            where: { id: request.user.sub },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            }
        })

        return user
    })
}
