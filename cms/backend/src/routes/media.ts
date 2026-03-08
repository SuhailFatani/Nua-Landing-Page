import path from 'path'
import fs from 'fs'
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { v2 as cloudinary } from 'cloudinary'
import { v4 as uuid } from 'uuid'
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

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const UPLOADS_DIR = path.resolve(__dirname, '../../uploads')

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

// ─── Check if Cloudinary is properly configured ──────────────
function isCloudinaryConfigured(): boolean {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env
  return !!(
    CLOUDINARY_CLOUD_NAME &&
    CLOUDINARY_API_KEY &&
    CLOUDINARY_API_SECRET &&
    CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
    CLOUDINARY_API_KEY !== 'your_api_key' &&
    CLOUDINARY_API_SECRET !== 'your_api_secret'
  )
}

// ─── Configure Cloudinary ─────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

// ─── Upload via Cloudinary ────────────────────────────────────
async function uploadToCloudinary(
  buffer: Buffer,
  safeFilename: string
): Promise<{ url: string; publicId: string; width?: number; height?: number }> {
  const result = await new Promise<{
    secure_url: string
    public_id: string
    width?: number
    height?: number
  }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'nua-cms',
        public_id: safeFilename.split('.')[0],
        resource_type: 'auto',
        type: 'upload',
      },
      (error, res) => {
        if (error || !res) return reject(error ?? new Error('No result from Cloudinary'))
        resolve(res)
      }
    )
    stream.end(buffer)
  })

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  }
}

// ─── Upload to local disk ─────────────────────────────────────
async function uploadToLocal(
  buffer: Buffer,
  safeFilename: string,
  baseUrl: string
): Promise<{ url: string; publicId: string; width?: undefined; height?: undefined }> {
  const filePath = path.join(UPLOADS_DIR, safeFilename)
  fs.writeFileSync(filePath, buffer)

  return {
    url: `${baseUrl}/api/media/files/${safeFilename}`,
    publicId: safeFilename,
  }
}

// ─────────────────────────────────────────────────────────────
export async function mediaRoutes(app: FastifyInstance) {

  // ── GET /api/media/files/:filename — serve local uploads ─────
  app.get<{ Params: { filename: string } }>('/files/:filename', async (request, reply) => {
    const { filename } = request.params

    // Security: strip any path traversal attempts
    const safeFilename = path.basename(filename)
    const filePath = path.join(UPLOADS_DIR, safeFilename)

    if (!fs.existsSync(filePath)) {
      return reply.status(404).send({ message: 'File not found.' })
    }

    // Determine MIME type from extension
    const ext = path.extname(safeFilename).toLowerCase()
    const mimeMap: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf',
    }
    const contentType = mimeMap[ext] ?? 'application/octet-stream'

    const fileBuffer = fs.readFileSync(filePath)
    return reply
      .header('Content-Type', contentType)
      .header('Cache-Control', 'public, max-age=31536000, immutable')
      .send(fileBuffer)
  })

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

    let data: Awaited<ReturnType<typeof request.file>>
    try {
      data = await request.file()
    } catch (err: any) {
      // Fastify multipart throws when file exceeds limit
      if (err?.code === 'FST_FILES_LIMIT' || err?.statusCode === 413 || err?.code === 'FST_REQ_FILE_TOO_LARGE') {
        return reply.status(413).send({
          message: `File too large. Maximum allowed size is 10 MB.`,
        })
      }
      return reply.status(400).send({ message: 'Could not read upload. Make sure you are sending a multipart/form-data request.' })
    }

    if (!data) {
      return reply.status(400).send({
        message: 'No file received. Please select a file and try again.',
      })
    }

    // ── Read into buffer ──────────────────────────────────────
    let buffer: Buffer
    try {
      buffer = await data.toBuffer()
    } catch (err: any) {
      if (err?.code === 'FST_REQ_FILE_TOO_LARGE' || (err?.message ?? '').includes('limit')) {
        return reply.status(413).send({
          message: `File too large. Maximum allowed size is 10 MB.`,
        })
      }
      return reply.status(400).send({ message: 'Failed to read file data. Please try again.' })
    }

    // ── Hard-check size (in case multipart limit fires late) ──
    if (buffer.length > MAX_FILE_SIZE) {
      return reply.status(413).send({
        message: `File too large (${(buffer.length / 1024 / 1024).toFixed(1)} MB). Maximum allowed size is 10 MB.`,
      })
    }

    // ── Validate file type by magic bytes ─────────────────────
    let mimeType: string | null = null
    try {
      const fileTypeMod: any = await import('file-type')
      const fromBuffer = fileTypeMod.fromBuffer ?? fileTypeMod.default?.fromBuffer
      const detectedType = fromBuffer ? await fromBuffer(buffer) : null
      // SVGs are XML text — file-type can't detect them; trust Content-Type header for SVG only
      mimeType = detectedType?.mime ?? (
        data.mimetype === 'image/svg+xml' ? 'image/svg+xml' : null
      )
    } catch {
      // Fall back to Content-Type header if file-type module fails
      mimeType = ALLOWED_MIME_TYPES.has(data.mimetype) ? data.mimetype : null
    }

    if (!mimeType || !ALLOWED_MIME_TYPES.has(mimeType)) {
      const receivedType = data.mimetype || 'unknown'
      return reply.status(400).send({
        message: `File type "${receivedType}" is not allowed. Please upload: JPEG, PNG, WebP, GIF, SVG, or PDF.`,
      })
    }

    // ── Generate safe filename ─────────────────────────────────
    const extension = mimeType.split('/')[1]?.replace('jpeg', 'jpg').replace('svg+xml', 'svg') ?? 'bin'
    const safeFilename = `${uuid()}.${extension}`

    // ── Upload: Cloudinary if configured, else local disk ─────
    let uploadResult: { url: string; publicId: string; width?: number; height?: number }
    const usingCloudinary = isCloudinaryConfigured()

    try {
      if (usingCloudinary) {
        uploadResult = await uploadToCloudinary(buffer, safeFilename)
      } else {
        // Derive base URL from request
        const protocol = request.headers['x-forwarded-proto'] ?? 'http'
        const host = request.headers.host ?? `localhost:3001`
        const baseUrl = `${protocol}://${host}`
        uploadResult = await uploadToLocal(buffer, safeFilename, baseUrl)
        app.log.info(`📁 Stored locally (Cloudinary not configured): ${safeFilename}`)
      }
    } catch (err) {
      app.log.error(err)
      const detail = usingCloudinary
        ? 'Could not reach Cloudinary. Check your CLOUDINARY_* environment variables.'
        : 'Could not save file to disk.'
      return reply.status(500).send({
        message: `Upload failed: ${detail}`,
      })
    }

    // ── Persist to database ───────────────────────────────────
    const media = await prisma.media.create({
      data: {
        filename: safeFilename,
        originalName: (data.filename ?? 'upload').slice(0, 255),
        mimeType,
        size: buffer.length,
        url: uploadResult.url,
        publicId: uploadResult.publicId,
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
        newValue: JSON.stringify({
          filename: safeFilename,
          mimeType,
          size: buffer.length,
          storage: usingCloudinary ? 'cloudinary' : 'local',
        }),
        ipAddress: request.ip,
      },
    })

    return reply.status(201).send(media)
  })

  // ── PATCH /api/media/:id — update alt text ─────────────────
  app.patch<{ Params: { id: string }; Body: { alt?: string } }>('/:id', {
    preHandler: [authenticate, requireRole('ADMIN', 'EDITOR')],
  }, async (request, reply) => {
    const { id } = request.params
    const body = request.body as { alt?: string } | undefined
    const alt = typeof body?.alt === 'string' ? body.alt.slice(0, 255) : undefined

    const media = await prisma.media.update({
      where: { id },
      data: { alt },
    })

    return reply.send(media)
  })

  // ── DELETE /api/media/:id — admin only ───────────────────────
  app.delete<{ Params: { id: string } }>('/:id', {
    preHandler: [authenticate, requireRole('ADMIN')],
  }, async (request, reply) => {
    const { id } = request.params
    const media = await prisma.media.findUnique({ where: { id } })

    if (!media) return reply.status(404).send({ message: 'Media not found.' })

    // Delete from Cloudinary if publicId doesn't look like a local filename
    if (isCloudinaryConfigured() && !media.publicId.includes('.')) {
      try {
        await cloudinary.uploader.destroy(media.publicId)
      } catch (err) {
        app.log.warn(`Cloudinary delete failed for ${media.publicId}: ${err}`)
      }
    } else {
      // Delete local file
      const localPath = path.join(UPLOADS_DIR, media.publicId)
      if (fs.existsSync(localPath)) {
        try { fs.unlinkSync(localPath) } catch {}
      }
    }

    await prisma.media.delete({ where: { id } })

    const user = request.user as { sub: string }
    await prisma.auditLog.create({
      data: {
        userId: user.sub,
        action: 'media.delete',
        resource: 'media',
        resourceId: id,
        oldValue: JSON.stringify({ filename: media.filename, url: media.url }),
        ipAddress: request.ip,
      },
    })

    return reply.send({ message: 'Media deleted.' })
  })
}
