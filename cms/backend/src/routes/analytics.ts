import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { createHash } from 'crypto'
import { z } from 'zod'
import { prisma } from '../plugins/db'
import { authenticate, requireRole } from '../middleware/auth'

// Hash IP for GDPR compliance — never store raw IP in analytics
function hashIp(ip: string): string {
  return createHash('sha256').update(ip + (process.env.IP_HASH_SALT || 'nua')).digest('hex').slice(0, 16)
}

const pageviewSchema = z.object({
  page: z.string().min(1).max(200),
  referrer: z.string().max(500).optional(),
  sessionId: z.string().max(64).optional(),
})

const eventSchema = z.object({
  type: z.string().min(1).max(60),
  page: z.string().min(1).max(200),
  label: z.string().max(100).optional(),
  metadata: z.record(z.unknown()).optional(),
  sessionId: z.string().max(64).optional(),
})

// ─────────────────────────────────────────────────────────────
export async function analyticsRoutes(app: FastifyInstance) {

  // ── POST /api/analytics/pageview — called by every landing page ──
  app.post('/pageview', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = pageviewSchema.safeParse(request.body)
    if (!parsed.success) return reply.status(400).send({ message: 'Invalid.' })

    // Fire and forget — don't block the response
    prisma.pageView.create({
      data: {
        page: parsed.data.page,
        ipHash: hashIp(request.ip),
        referrer: parsed.data.referrer?.slice(0, 500),
        userAgent: request.headers['user-agent']?.slice(0, 300),
        sessionId: parsed.data.sessionId,
      },
    }).catch(() => {})  // never fail the visitor's request over analytics

    return reply.status(204).send()
  })


  // ── POST /api/analytics/event — track button clicks, CTAs ────
  app.post('/event', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = eventSchema.safeParse(request.body)
    if (!parsed.success) return reply.status(400).send({ message: 'Invalid.' })

    prisma.event.create({
      data: {
        type: parsed.data.type,
        page: parsed.data.page,
        label: parsed.data.label,
        // Store as JSON string — SQLite stores as TEXT
        metadata: parsed.data.metadata ? JSON.stringify(parsed.data.metadata) : null,
        sessionId: parsed.data.sessionId,
        ipHash: hashIp(request.ip),
      },
    }).catch(() => {})

    return reply.status(204).send()
  })


  // ── GET /api/analytics/dashboard — admin overview ─────────────
  app.get('/dashboard', {
    preHandler: [authenticate, requireRole('ADMIN', 'EDITOR')],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const query = request.query as { days?: string }
    const days = Math.min(90, Math.max(1, Number(query.days) || 30))
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    // Run in parallel — not in a transaction (groupBy doesn't compose well in $transaction)
    const [
      totalVisitors,
      pageViewsRaw,
      topPages,
      topReferrers,
      eventCounts,
      demoBookings,
      bookingsBySource,
    ] = await Promise.all([

      // Total unique visitors (by ipHash) in period
      prisma.pageView.groupBy({
        by: ['ipHash'],
        where: { createdAt: { gte: since } },
        orderBy: { ipHash: 'asc' },
        _count: { id: true },
      }),

      // Total pageviews in period
      prisma.pageView.count({ where: { createdAt: { gte: since } } }),

      // Top pages by view count
      prisma.pageView.groupBy({
        by: ['page'],
        where: { createdAt: { gte: since } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),

      // Top referrers
      prisma.pageView.groupBy({
        by: ['referrer'],
        where: { createdAt: { gte: since }, referrer: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 8,
      }),

      // Events breakdown
      prisma.event.groupBy({
        by: ['type', 'label'],
        where: { createdAt: { gte: since } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 20,
      }),

      // Demo bookings count and recent
      prisma.demoBooking.findMany({
        where: { createdAt: { gte: since } },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, name: true, email: true, company: true,
          status: true, source: true, createdAt: true,
        },
        take: 50,
      }),

      // Demo bookings by source
      prisma.demoBooking.groupBy({
        by: ['source'],
        where: { createdAt: { gte: since } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
    ])

    // Daily unique visitors — SQLite-compatible (strftime)
    // For PostgreSQL, replace strftime('%Y-%m-%d', created_at) with DATE(created_at)
    let dailyVisitors: Array<{ date: string; visitors: number }> = []
    try {
      dailyVisitors = await prisma.$queryRaw<Array<{ date: string; visitors: number }>>`
        SELECT
          strftime('%Y-%m-%d', created_at) AS date,
          COUNT(DISTINCT ip_hash) AS visitors
        FROM page_views
        WHERE created_at >= ${since}
        GROUP BY strftime('%Y-%m-%d', created_at)
        ORDER BY date ASC
      `
    } catch {
      // Gracefully degrade if raw query fails (e.g., different DB engine)
    }

    return reply.send({
      period: { days, since },
      summary: {
        uniqueVisitors: totalVisitors.length,
        pageViews: pageViewsRaw,
        demoBookings: demoBookings.length,
        avgViewsPerVisitor: totalVisitors.length > 0
          ? Math.round((pageViewsRaw / totalVisitors.length) * 10) / 10
          : 0,
      },
      topPages: topPages.map(p => ({ page: p.page, views: p._count.id })),
      topReferrers: topReferrers
        .filter(r => r.referrer)
        .map(r => ({ referrer: r.referrer, visits: r._count.id })),
      events: eventCounts.map(e => ({
        type: e.type,
        label: e.label,
        count: e._count.id,
      })),
      demoBookings,
      bookingsBySource: bookingsBySource.map(b => ({
        source: b.source || 'direct',
        count: b._count.id,
      })),
      dailyVisitors,
    })
  })


  // ── GET /api/analytics/realtime — last 30 min ─────────────────
  app.get('/realtime', {
    preHandler: [authenticate, requireRole('ADMIN', 'EDITOR')],
  }, async (_request: FastifyRequest, reply: FastifyReply) => {
    const since = new Date(Date.now() - 30 * 60 * 1000)

    const [activeVisitors, recentPages] = await Promise.all([
      prisma.pageView.groupBy({
        by: ['ipHash'],
        where: { createdAt: { gte: since } },
        orderBy: { ipHash: 'asc' },
        _count: { id: true },
      }),
      prisma.pageView.groupBy({
        by: ['page'],
        where: { createdAt: { gte: since } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),
    ])

    return reply.send({
      activeVisitors: activeVisitors.length,
      topPages: recentPages.map(p => ({ page: p.page, views: p._count.id })),
    })
  })
}
