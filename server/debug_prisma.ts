import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('--- DIAGNÓSTICO PRISMA ---')
  try {
    // Tenta acessar o dmmf para ver os modelos carregados
    // @ts-ignore
    const model = prisma._baseClient._dmmf.modelMap['GastoOperacional']
    console.log('Campos detectados no modelo GastoOperacional:')
    model.fields.forEach((f: any) => {
      console.log(`- ${f.name} (${f.type})`)
    })
  } catch (e) {
    console.error('Erro ao investigar modelo:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
