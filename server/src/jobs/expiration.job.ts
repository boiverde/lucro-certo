import { prisma } from '../lib/prisma'

/**
 * Job de Expiração de Planos
 * Procura usuários PRO com data de expiração passada e rebaixa para FREE.
 */
export async function runExpirationJob() {
    console.log('[JOB-EXPIRATION] Iniciando verificação de planos expirados...')
    
    try {
        const now = new Date()
        
        const expiredUsers = await prisma.user.updateMany({
            where: {
                plan: 'pro',
                planExpiresAt: {
                    lt: now
                }
            },
            data: {
                plan: 'free'
            }
        })

        if (expiredUsers.count > 0) {
            console.log(`[JOB-EXPIRATION] ${expiredUsers.count} usuários rebaixados para FREE automaticamente.`)
        } else {
            console.log('[JOB-EXPIRATION] Nenhum plano expirado encontrado.')
        }
    } catch (err: any) {
        console.error('[JOB-EXPIRATION] Erro ao executar job:', err.message)
    }
}
