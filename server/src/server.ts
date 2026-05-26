import { app } from './app'
import dotenv from 'dotenv'
import { runExpirationJob } from './jobs/expiration.job'

dotenv.config()

const PORT = Number(process.env.PORT) || 3333

app.listen({
    port: PORT,
    host: '0.0.0.0', // Necessário para Docker
}).then(() => {
    console.log(`🚀 HTTP Server running on http://localhost:${PORT}`)

    // Executa job de expiração de planos na inicialização e a cada 1 hora
    runExpirationJob()
    setInterval(runExpirationJob, 60 * 60 * 1000)
    console.log('[JOB] Expiration job agendado (intervalo: 1h)')
})
