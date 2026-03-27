import { FastifyInstance } from 'fastify'
import { uploadPublic, uploadPrivate, getFileSignedUrl } from '../lib/storage'
import { z } from 'zod'

export async function uploadRoutes(app: FastifyInstance) {
    app.addHook('onRequest', app.authenticate)

    // Upload Público (Imagens de Produto, etc)
    app.post('/public', async (request, reply) => {
        const data = await request.file()

        if (!data) {
            return reply.status(400).send({ message: 'Arquivo não enviado' })
        }

        try {
            const result = await uploadPublic(data)
            return result
        } catch (error) {
            console.error('Upload error:', error)
            return reply.status(500).send({ message: 'Erro ao fazer upload' })
        }
    })

    // Upload Privado (Documentos, Notas)
    app.post('/private', async (request, reply) => {
        const data = await request.file()

        if (!data) {
            return reply.status(400).send({ message: 'Arquivo não enviado' })
        }

        try {
            const result = await uploadPrivate(data)
            return result
        } catch (error) {
            console.error('Upload error:', error)
            return reply.status(500).send({ message: 'Erro ao fazer upload' })
        }
    })

    // Obter URL assinada para arquivo privado
    app.get('/private/:key', async (request, reply) => {
        const { key } = request.params as { key: string } // cast simples pois Zod com multipart é chato
        // Idealmente usaria Zod no params, mas vamos simplificar aqui pois app.register(multipart) muda o request

        try {
            const url = await getFileSignedUrl(key)
            return { url }
        } catch (error) {
            return reply.status(404).send({ message: 'Arquivo não encontrado' })
        }
    })
}
