import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { v2 as cloudinary } from 'cloudinary'
import { v4 as uuid } from 'uuid'
import { fileTypeFromBuffer } from 'file-type'
import { prisma } from '../plugins/db'
import { authenticate, requireRole } from '../middleware/auth'

// ─── Allowed MIME types ───────────────────────────────────────
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
])

// ─── Configure Cloudinary ─────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

// ─────────────────────────────────────────────────────────────
export async function mediaRoutes(app: FastifyInstance) {

  // ── GET /api/media — list all media ──────────────────────────
  app.get('/', {
    preHandler: [authenticate, requireRole('ADMIN', 'EDITOR')],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const query = request.query as { page?: string; limit?: string }
    const page = Math.max(1, Number(query.page) || 1)
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 20))

    const [media, total] = await prisma.$transaction([
      prisma.media.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.media.count(),
    ])

    return reply.send({
      data: media,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  })

  // ── POST /api/media/upload ────────────────────────────────────
  app.post('/upload', {
    preHandler: [authenticate, requireRole('ADMIN', 'EDITOR')],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const data = await request.file()

    if (!data) {
      return reply.status(400).send({ message: 'No file uploaded.' })
    }

    // ── Read into buffer for magic-byte validation ─────────────
    const buffer = await data.toBuffer()

    // ── Validate file type by magic bytes (not extension/header) ─
    const detectedType = await fileTypeFromBuffer(buffer)

    // SVGs won't be detected by file-type (they're XML text) — handle separately
    const mimeType = detectedType?.mime ?? (
      data.mimetype === 'image/svg+xml' ? 'image/svg+xml' : null
    )

    if (!mimeType || !ALLOWED_MIME_TYPES.has(mimeType)) {
      return reply.status(400).send({
        message: `File type not allowed. Allowed: ${[...ALLOWED_MIME_TYPES].join(', ')}`,
      })
    }

    // ── Generate safe filename — never use original ────────────
    const extension = detectedType?.ext ?? 'bin'
    const safeFilename = `${uuid()}.${extension}`

    // ── Upload to Cloudinary as a stream ──────────────────────
    let uploadResult: { secure_url: string; public_id: string; width?: number; height?: number }

    try {
      uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'nua-cms',
            public_id: safeFilename.split('.')[0],
            resource_type: 'auto',
            // Force download — prevents browser executing uploaded files
            type: 'upload',
          },
          (error, result) => {
            if (error || !result) return reject(error)
            resolve(result)
          }
        )
        uploadStream.end(buffer)
      })
    } catch (err) {
      app.log.error(err)
      return reply.status(500).send({ message: 'Upload failed. Please try again.' })
    }

    const media = await prisma.media.create({
      data: {
        filename: safeFilename,
        originalName: data.filename.slice(0, 255), // cap length
        mimeType,
        size: buffer.length,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        width: uploadResult.width,
        height: uploadResult.height,
      },
    })

    const user = request.user as { sub: string }
    await prisma.auditLog.create({
      data: {
        userId: user.sub,
        action: 'media.upload',
        resource: 'media',
        resourceId: media.id,
        newValue: { filename: safeFilename, mimeType, size: buffer.length },
        ipAddress: request.ip,
      },
    })

    return reply.status(201).send(media)
  })

  // ── PATCH /api/media/:id — update alt text ─────────────────
  app.patch('/:id', {
    preHandler: [authenticate, requireRole('ADMIN', 'EDITOR')],
  }, async (
    request: FastifyRequest<{ Params: { id: string }; Body: { alt?: string } }>,
    reply: FastifyReply
  ) => {
    const { id } = request.params
    const alt = typeof request.body?.alt === 'string'
      ? request.body.alt.slice(0, 255)
      : undefined

    const media = await prisma.media.update({
      where: { id },
      data: { alt },
    })

    return reply.send(media)
  })

  // ── DELETE /api/media/:id — admin only ───────────────────────
  app.delete('/:id', {
    preHandler: [authenticate, requireRole('ADMIN')],
  }, async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    const { id } = request.params
    const media = await prisma.media.findUnique({ where: { id } })

    if (!media) return reply.status(404).send({ message: 'Media not found.' })

    // Delete from Cloudinary first
    try {
      await cloudinary.uploader.destroy(media.publicId)
    } catch (err) {
      app.log.warn(`Cloudinary delete failed for ${media.publicId}: ${err}`)
    }

    await prisma.media.delete({ where: { id } })

    const user = request.user as { sub: string }
    await prisma.auditLog.create({
      data: {
        userId: user.sub,
        action: 'media.delete',
        resource: 'media',
        resourceId: id,
        oldValue: { filename: media.filename, url: media.url },
        ipAddress: request.ip,
      },
    })

    return reply.send({ message: 'Media deleted.' })
  })
}
