
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('--- Iniciando Auditoria de Colunas do Banco ---')
  try {
    const user = await prisma.user.findFirst()
    if (user) {
      console.log('Campos detectados no modelo User:', Object.keys(user))
    } else {
      console.log('Nenhum usuário encontrado no banco para teste.')
    }
  } catch (err: any) {
    console.error('ERRO CRÍTICO NA AUDITORIA:', err.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
