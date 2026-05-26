import { FastifyInstance } from 'fastify'
import { uploadPublic, uploadPrivate, getFileSignedUrl } from '../lib/storage'
import { z } from 'zod'

export async function uploadRoutes(app: FastifyInstance) {
    app.addHook('onRequest', (app as any).authenticate)

    // Upload Público (Imagens de Produto, etc)
    app.post('/public', async (request, reply) => {
        const data = await request.file()

        if (!data) {
            throw { statusCode: 400, message: 'Arquivo não enviado', code: 'BAD_REQUEST' }
        }

        const result = await uploadPublic(data)
        return result
    })

    // Upload Privado (Documentos, Notas)
    app.post('/private', async (request, reply) => {
        const data = await request.file()

        if (!data) {
            throw { statusCode: 400, message: 'Arquivo não enviado', code: 'BAD_REQUEST' }
        }

        const result = await uploadPrivate(data)
        return result
    })

    // Obter URL assinada para arquivo privado
    app.get('/private/:key', async (request, reply) => {
        const { key } = request.params as { key: string } // cast simples pois Zod com multipart é chato

        try {
            const url = await getFileSignedUrl(key)
            return { url }
        } catch (error) {
            throw { statusCode: 404, message: 'Arquivo privado não encontrado', code: 'NOT_FOUND' }
        }
    })
}
