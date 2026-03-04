import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { prisma } from '../plugins/db'
import { authenticate, requireRole } from '../middleware/auth'

// Valid page slugs (replaces enum)
const VALID_SLUGS = ['home', 'pricing', 'services', 'company', 'blog', 'book_a_demo'] as const

const updatePageSchema = z.object({
  title: z.string().min(1).max(160).optional(),
  metaDesc: z.string().max(320).optional(),
  content: z.record(z.unknown()),  // flexible JSON — serialized to string in SQLite
  isPublished: z.boolean().optional(),
})

// ─────────────────────────────────────────────────────────────
export async function pagesRoutes(app: FastifyInstance) {

  // ── GET /api/pages — public — used by landing pages ──────────
  app.get('/', async (_request: FastifyRequest, reply: FastifyReply) => {
    const pages = await prisma.page.findMany({
      where: { isPublished: true },
      select: { slug: true, title: true, metaDesc: true, content: true, updatedAt: true },
    })
    return reply.send(pages)
  })

  // ── GET /api/pages/:slug — public ─────────────────────────────
  app.get<{ Params: { slug: string } }>('/:slug', async (request, reply) => {
    const { slug } = request.params

    if (!(VALID_SLUGS as readonly string[]).includes(slug)) {
      return reply.status(404).send({ message: 'Page not found.' })
    }

    const page = await prisma.page.findUnique({ where: { slug } })

    if (!page || !page.isPublished) {
      return reply.status(404).send({ message: 'Page not found.' })
    }

    // Parse content JSON string back to object for response
    return reply.send({ ...page, content: JSON.parse(page.content) })
  })

  // ── GET /api/pages/admin/all — admin only ─────────────────────
  app.get('/admin/all', {
    preHandler: [authenticate, requireRole('ADMIN', 'EDITOR')],
  }, async (_request: FastifyRequest, reply: FastifyReply) => {
    const pages = await prisma.page.findMany({
      orderBy: { slug: 'asc' },
    })
    return reply.send(pages)
  })

  // ── PUT /api/pages/:slug — update page content ────────────────
  app.put<{ Params: { slug: string } }>('/:slug', {
    preHandler: [authenticate, requireRole('ADMIN', 'EDITOR')],
  }, async (request, reply) => {
    const { slug } = request.params
    const parsed = updatePageSchema.safeParse(request.body)
    const user = request.user as { sub: string; role: string }

    if (!parsed.success) {
      return reply.status(400).send({ message: parsed.error.errors[0].message })
    }

    if (!(VALID_SLUGS as readonly string[]).includes(slug)) {
      return reply.status(404).send({ message: 'Page not found.' })
    }

    // Snapshot old value for audit log
    const oldPage = await prisma.page.findUnique({ where: { slug } })

    const updated = await prisma.page.upsert({
      where: { slug },
      update: {
        title: parsed.data.title,
        metaDesc: parsed.data.metaDesc,
        content: parsed.data.content ? JSON.stringify(parsed.data.content) : undefined,
        isPublished: parsed.data.isPublished,
        publishedAt: parsed.data.isPublished ? new Date() : undefined,
      },
      create: {
        slug,
        title: parsed.data.title ?? slug,
        content: JSON.stringify(parsed.data.content ?? {}),
        isPublished: parsed.data.isPublished ?? true,
        publishedAt: parsed.data.isPublished ? new Date() : null,
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: user.sub,
        action: 'page.update',
        resource: 'pages',
        resourceId: updated.id,
        // JSON.stringify because SQLite stores oldValue/newValue as TEXT
        oldValue: oldPage ? JSON.stringify({ title: oldPage.title, isPublished: oldPage.isPublished }) : null,
        newValue: JSON.stringify({ title: updated.title, isPublished: updated.isPublished }),
        ipAddress: request.ip,
      },
    })

    return reply.send(updated)
  })
}
