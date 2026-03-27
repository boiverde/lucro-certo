import { app } from './app'
import dotenv from 'dotenv'

dotenv.config()

const PORT = Number(process.env.PORT) || 3333

app.listen({
    port: PORT,
    host: '0.0.0.0', // Necessário para Docker
}).then(() => {
    console.log(`🚀 HTTP Server running on http://localhost:${PORT}`)
})
