import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import crypto from 'node:crypto'

const s3 = new S3Client({
    region: 'us-east-1',
    endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
        secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin'
    },
    forcePathStyle: true // Necessário para MinIO
})

const BUCKET = process.env.S3_BUCKET || 'uploads'
const PUBLIC_URL = process.env.S3_PUBLIC_URL || 'http://localhost:9000/uploads'

export async function uploadPublic(file: any) {
    const fileExtension = file.filename.split('.').pop()
    const fileName = `${crypto.randomUUID()}.${fileExtension}`
    const buffer = await file.toBuffer()

    await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: fileName,
        Body: buffer,
        ContentType: file.mimetype,
        ACL: 'public-read' // MinIO ignora ACL se policy for setada, mas enviamos
    }))

    return {
        url: `${PUBLIC_URL}/${fileName}`,
        key: fileName
    }
}

export async function uploadPrivate(file: any) {
    const fileExtension = file.filename.split('.').pop()
    const fileName = `private/${crypto.randomUUID()}.${fileExtension}`
    const buffer = await file.toBuffer()

    await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: fileName,
        Body: buffer,
        ContentType: file.mimetype,
    }))

    return {
        key: fileName
    }
}

export async function getFileSignedUrl(key: string) {
    const command = new GetObjectCommand({
        Bucket: BUCKET,
        Key: key
    })

    // URL válida por 1 hora
    return getSignedUrl(s3, command, { expiresIn: 3600 })
}
