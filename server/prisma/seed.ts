import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'admin@lucrocerto.com'
    const password = 'admin' // Senha fraca para seed

    const userExists = await prisma.user.findUnique({ where: { email } })

    if (!userExists) {
        const password_hash = await bcrypt.hash(password, 6)

        await prisma.user.create({
            data: {
                name: 'Administrador Local',
                email,
                password_hash,
            }
        })
        console.log(`User created: ${email} / ${password}`)
    } else {
        console.log('User already exists.')
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
