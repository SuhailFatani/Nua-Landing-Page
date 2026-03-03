import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import argon2 from 'argon2'
import { z } from 'zod'
import { randomBytes, createHash } from 'crypto'
import { prisma } from '../plugins/db'
import { authenticate } from '../middleware/auth'

// ─── Argon2id config (OWASP 2025 minimum) ────────────────────
const ARGON2_OPTIONS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 19456,  // 19 MiB
  timeCost: 2,
  parallelism: 1,
}

// ─── Token config ─────────────────────────────────────────────
const ACCESS_TOKEN_TTL = '15m'
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000  // 7 days
const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 15 * 60 * 1000  // 15 minutes

// ─── Validation schemas ───────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(128),
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(128),
  newPassword: z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .max(128)
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
})

// ─── Helpers ──────────────────────────────────────────────────
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

function generateRefreshToken(): string {
  return randomBytes(48).toString('hex')
}

function getRefreshCookieOptions(isProd: boolean) {
  return {
    httpOnly: true,        // JS cannot read — XSS-proof
    secure: isProd,        // HTTPS only in production
    sameSite: 'strict' as const,  // CSRF protection
    path: '/api/auth',     // Only sent to auth routes
    maxAge: REFRESH_TOKEN_TTL_MS / 1000,
  }
}

// ─────────────────────────────────────────────────────────────
export async function authRoutes(app: FastifyInstance) {

  // ── POST /api/auth/login ─────────────────────────────────────
  app.post('/login', {
    config: {
      rateLimit: {
        max: 5,            // 5 attempts per 15 min — brute force protection
        timeWindow: '15 minutes',
        ban: 3,            // ban IP after 3 rate limit violations
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = loginSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ statusCode: 400, message: 'Invalid credentials.' })
    }

    const { email, password } = parsed.data
    const ip = request.ip
    const isProd = process.env.NODE_ENV === 'production'

    const user = await prisma.user.findUnique({ where: { email } })

    // ── Account lockout check ──────────────────────────────────
    if (user?.lockedUntil && user.lockedUntil > new Date()) {
      return reply.status(403).send({
        statusCode: 403,
        message: 'Account temporarily locked. Try again in 15 minutes.',
      })
    }

    // ── Verify password ────────────────────────────────────────
    // Always run argon2.verify even if user not found — prevents timing attacks
    const dummyHash = '$argon2id$v=19$m=19456,t=2,p=1$invalidsalt$invalidhash'
    const passwordValid = user
      ? await argon2.verify(user.passwordHash, password, ARGON2_OPTIONS)
      : await argon2.verify(dummyHash, password).catch(() => false)

    if (!user || !passwordValid || !user.isActive) {
      // Increment failed attempts if user exists
      if (user) {
        const failedAttempts = user.failedLoginAttempts + 1
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: failedAttempts,
            lockedUntil: failedAttempts >= MAX_FAILED_ATTEMPTS
              ? new Date(Date.now() + LOCKOUT_DURATION_MS)
              : null,
          },
        })
      }

      // Generic error — never reveal if email exists
      return reply.status(401).send({
        statusCode: 401,
        message: 'Invalid email or password.',
      })
    }

    // ── Issue tokens ───────────────────────────────────────────
    const accessToken = app.jwt.sign(
      { sub: user.id, email: user.email, role: user.role, name: user.name },
      { expiresIn: ACCESS_TOKEN_TTL }
    )

    const refreshToken = generateRefreshToken()
    const family = randomBytes(16).toString('hex')

    await prisma.$transaction([
      // Store hashed refresh token — never store plaintext
      prisma.refreshToken.create({
        data: {
          tokenHash: hashToken(refreshToken),
          userId: user.id,
          family,
          expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
        },
      }),
      // Reset failed attempts on successful login
      prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
          lastLoginAt: new Date(),
          lastLoginIp: ip,
        },
      }),
    ])

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'auth.login',
        resource: 'users',
        resourceId: user.id,
        ipAddress: ip,
        userAgent: request.headers['user-agent'],
      },
    })

    // Set refresh token in httpOnly cookie — never in response body
    reply.setCookie('refresh_token', refreshToken, getRefreshCookieOptions(isProd))

    return reply.send({
      accessToken,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, avatarUrl: user.avatarUrl },
    })
  })


  // ── POST /api/auth/refresh ────────────────────────────────────
  app.post('/refresh', async (request: FastifyRequest, reply: FastifyReply) => {
    const refreshToken = request.cookies.refresh_token
    const isProd = process.env.NODE_ENV === 'production'

    if (!refreshToken) {
      return reply.status(401).send({ statusCode: 401, message: 'No refresh token.' })
    }

    const tokenHash = hashToken(refreshToken)
    const stored = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    })

    // ── Token reuse detection (theft signal) ─────────────────
    if (!stored) {
      // If the token hash doesn't exist, it was already rotated — possible theft
      // Find by family and revoke all tokens in that family
      reply.clearCookie('refresh_token', { path: '/api/auth' })
      return reply.status(401).send({ statusCode: 401, message: 'Invalid refresh token.' })
    }

    if (stored.revokedAt || stored.expiresAt < new Date()) {
      // Revoke entire family — token reuse detected
      await prisma.refreshToken.updateMany({
        where: { family: stored.family },
        data: { revokedAt: new Date() },
      })
      reply.clearCookie('refresh_token', { path: '/api/auth' })
      return reply.status(401).send({ statusCode: 401, message: 'Session expired. Please log in again.' })
    }

    const user = stored.user
    if (!user.isActive) {
      return reply.status(403).send({ statusCode: 403, message: 'Account is deactivated.' })
    }

    // ── Rotate: revoke old, issue new ─────────────────────────
    const newRefreshToken = generateRefreshToken()

    await prisma.$transaction([
      prisma.refreshToken.update({
        where: { id: stored.id },
        data: { revokedAt: new Date() },
      }),
      prisma.refreshToken.create({
        data: {
          tokenHash: hashToken(newRefreshToken),
          userId: user.id,
          family: stored.family,  // same family for theft detection
          expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
        },
      }),
    ])

    const accessToken = app.jwt.sign(
      { sub: user.id, email: user.email, role: user.role, name: user.name },
      { expiresIn: ACCESS_TOKEN_TTL }
    )

    reply.setCookie('refresh_token', newRefreshToken, getRefreshCookieOptions(isProd))

    return reply.send({ accessToken })
  })


  // ── POST /api/auth/logout ─────────────────────────────────────
  app.post('/logout', { preHandler: [authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const refreshToken = request.cookies.refresh_token

    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: { tokenHash: hashToken(refreshToken) },
        data: { revokedAt: new Date() },
      })
    }

    reply.clearCookie('refresh_token', { path: '/api/auth' })

    const user = request.user as { sub: string }
    await prisma.auditLog.create({
      data: {
        userId: user.sub,
        action: 'auth.logout',
        resource: 'users',
        resourceId: user.sub,
        ipAddress: request.ip,
      },
    })

    return reply.send({ message: 'Logged out successfully.' })
  })


  // ── POST /api/auth/logout-all ─────────────────────────────────
  // Revoke ALL sessions — useful when password is compromised
  app.post('/logout-all', { preHandler: [authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { sub: string }

    await prisma.refreshToken.updateMany({
      where: { userId: user.sub, revokedAt: null },
      data: { revokedAt: new Date() },
    })

    reply.clearCookie('refresh_token', { path: '/api/auth' })

    return reply.send({ message: 'All sessions revoked.' })
  })


  // ── GET /api/auth/me ──────────────────────────────────────────
  app.get('/me', { preHandler: [authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { sub: string }

    const profile = await prisma.user.findUnique({
      where: { id: user.sub },
      select: { id: true, email: true, name: true, role: true, avatarUrl: true, lastLoginAt: true },
    })

    if (!profile) {
      return reply.status(404).send({ statusCode: 404, message: 'User not found.' })
    }

    return reply.send(profile)
  })


  // ── POST /api/auth/change-password ───────────────────────────
  app.post('/change-password', { preHandler: [authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = changePasswordSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({
        statusCode: 400,
        message: parsed.error.errors[0].message,
      })
    }

    const { currentPassword, newPassword } = parsed.data
    const currentUser = request.user as { sub: string }

    const user = await prisma.user.findUnique({ where: { id: currentUser.sub } })
    if (!user) return reply.status(404).send({ message: 'User not found.' })

    const valid = await argon2.verify(user.passwordHash, currentPassword, ARGON2_OPTIONS)
    if (!valid) {
      return reply.status(401).send({ statusCode: 401, message: 'Current password is incorrect.' })
    }

    const newHash = await argon2.hash(newPassword, ARGON2_OPTIONS)

    // Invalidate ALL sessions when password changes
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
      }),
      prisma.refreshToken.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ])

    reply.clearCookie('refresh_token', { path: '/api/auth' })

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'auth.password_changed',
        resource: 'users',
        resourceId: user.id,
        ipAddress: request.ip,
      },
    })

    return reply.send({ message: 'Password changed. Please log in again.' })
  })
}
