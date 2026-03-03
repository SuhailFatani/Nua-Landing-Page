import 'dotenv/config'
import Fastify from 'fastify'
import fastifyCookie from '@fastify/cookie'
import fastifyCors from '@fastify/cors'
import fastifyHelmet from '@fastify/helmet'
import fastifyJwt from '@fastify/jwt'
import fastifyRateLimit from '@fastify/rate-limit'
import fastifyMultipart from '@fastify/multipart'

import { authRoutes } from './routes/auth'
import { pagesRoutes } from './routes/pages'
import { blogRoutes } from './routes/blog'
import { mediaRoutes } from './routes/media'
import { usersRoutes } from './routes/users'
import { prisma } from './plugins/db'

const PORT = Number(process.env.PORT) || 3001
const NODE_ENV = process.env.NODE_ENV || 'development'
const isProd = NODE_ENV === 'production'

// ─────────────────────────────────────────────────────────────
// Wrap everything in async main() — avoids top-level await
// which is incompatible with CommonJS module mode
// ─────────────────────────────────────────────────────────────
async function main() {
  const app = Fastify({
    logger: {
      level: isProd ? 'warn' : 'info',
      ...(isProd ? {} : { transport: { target: 'pino-pretty' } }),
    },
    bodyLimit: 1_048_576, // Prevent ReDoS — reject bodies > 1MB
  })

  // ─────────────────────────────────────────────────────────────
  // SECURITY HEADERS (Helmet)
  // ─────────────────────────────────────────────────────────────
  await app.register(fastifyHelmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
        connectSrc: ["'self'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: isProd ? [] : null,
      },
    },
    hsts: isProd
      ? { maxAge: 31_536_000, includeSubDomains: true, preload: true }
      : false,
    frameguard: { action: 'deny' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })

  // ─────────────────────────────────────────────────────────────
  // CORS
  // ─────────────────────────────────────────────────────────────
  const allowedOrigins = [
    process.env.FRONTEND_URL ?? 'http://localhost:3000',
    process.env.ADMIN_URL ?? 'http://localhost:5500',
  ]
  await app.register(fastifyCors, {
    origin: (origin, cb) => {
      // Allow: no origin, null origin (file:// in browsers), localhost, or whitelisted origins
      if (
        !origin ||
        origin === 'null' ||
        /^file:\/\//.test(origin) ||
        allowedOrigins.includes(origin)
      ) {
        cb(null, true)
      } else {
        cb(new Error('Not allowed by CORS'), false)
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })

  // ─────────────────────────────────────────────────────────────
  // RATE LIMITING
  // ─────────────────────────────────────────────────────────────
  await app.register(fastifyRateLimit, {
    global: true,
    max: 120,
    timeWindow: '1 minute',
    errorResponseBuilder: () => ({
      statusCode: 429,
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Try again in a minute.',
    }),
  })

  // ─────────────────────────────────────────────────────────────
  // COOKIES (needed for httpOnly refresh tokens)
  // ─────────────────────────────────────────────────────────────
  await app.register(fastifyCookie, {
    secret: process.env.CSRF_SECRET ?? 'dev-csrf-secret',
  })

  // ─────────────────────────────────────────────────────────────
  // JWT
  // ─────────────────────────────────────────────────────────────
  await app.register(fastifyJwt, {
    secret: process.env.JWT_ACCESS_SECRET ?? 'dev-jwt-secret',
    sign: { expiresIn: '15m' },
  })

  // ─────────────────────────────────────────────────────────────
  // MULTIPART (file uploads — max 10MB)
  // ─────────────────────────────────────────────────────────────
  await app.register(fastifyMultipart, {
    limits: {
      fileSize: 10 * 1024 * 1024,
      files: 1,
    },
  })

  // ─────────────────────────────────────────────────────────────
  // ROUTES
  // ─────────────────────────────────────────────────────────────
  await app.register(authRoutes,  { prefix: '/api/auth' })
  await app.register(pagesRoutes, { prefix: '/api/pages' })
  await app.register(blogRoutes,  { prefix: '/api/blog' })
  await app.register(mediaRoutes, { prefix: '/api/media' })
  await app.register(usersRoutes, { prefix: '/api/users' })

  // Health check
  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  // ─────────────────────────────────────────────────────────────
  // GLOBAL ERROR HANDLER
  // ─────────────────────────────────────────────────────────────
  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error)

    if (error.validation) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Validation Error',
        message: error.message,
      })
    }

    const statusCode = error.statusCode ?? 500
    return reply.status(statusCode).send({
      statusCode,
      error: statusCode === 500 ? 'Internal Server Error' : error.name,
      message: isProd && statusCode === 500
        ? 'An unexpected error occurred.'
        : error.message,
    })
  })

  // ─────────────────────────────────────────────────────────────
  // START
  // ─────────────────────────────────────────────────────────────
  await app.listen({ port: PORT, host: '0.0.0.0' })
  console.log(`\n🚀 Nua CMS API running on http://localhost:${PORT}`)
  console.log(`📋 Health: http://localhost:${PORT}/health\n`)

  // Graceful shutdown
  const shutdown = async () => {
    await app.close()
    await prisma.$disconnect()
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

// ─────────────────────────────────────────────────────────────
// Run
// ─────────────────────────────────────────────────────────────
main().catch(async (err) => {
  console.error('❌ Failed to start server:', err)
  await prisma.$disconnect()
  process.exit(1)
})
