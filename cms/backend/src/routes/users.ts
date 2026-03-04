import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import argon2 from 'argon2'
import { z } from 'zod'
// Role values stored as strings: 'ADMIN' | 'EDITOR' | 'VIEWER'
import { prisma } from '../plugins/db'
import { authenticate, requireRole } from '../middleware/auth'

const ARGON2_OPTIONS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
}

const createUserSchema = z.object({
  email: z.string().email().toLowerCase(),
  name: z.string().min(1).max(100),
  password: z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .max(128)
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
  role: z.enum(['ADMIN', 'EDITOR', 'VIEWER']).default('EDITOR'),
})

const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  role: z.enum(['ADMIN', 'EDITOR', 'VIEWER']).optional(),
  isActive: z.boolean().optional(),
})

// ─────────────────────────────────────────────────────────────
export async function usersRoutes(app: FastifyInstance) {

  // ── GET /api/users — admin only ───────────────────────────────
  app.get('/', {
    preHandler: [authenticate, requireRole('ADMIN')],
  }, async (_request: FastifyRequest, reply: FastifyReply) => {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        avatarUrl: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return reply.send(users)
  })

  // ── POST /api/users — admin only — invite team member ─────────
  app.post('/', {
    preHandler: [authenticate, requireRole('ADMIN')],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = createUserSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ message: parsed.error.errors[0].message })
    }

    const { email, name, password, role } = parsed.data
    const actor = request.user as { sub: string }

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) {
      return reply.status(409).send({ message: 'Email already in use.' })
    }

    const passwordHash = await argon2.hash(password, ARGON2_OPTIONS)

    const user = await prisma.user.create({
      data: { email, name, passwordHash, role: role },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    })

    await prisma.auditLog.create({
      data: {
        userId: actor.sub,
        action: 'user.create',
        resource: 'users',
        resourceId: user.id,
        newValue: JSON.stringify({ email, name, role }),
        ipAddress: request.ip,
      },
    })

    return reply.status(201).send(user)
  })

  // ── PATCH /api/users/:id — admin only ─────────────────────────
  app.patch<{ Params: { id: string } }>('/:id', {
    preHandler: [authenticate, requireRole('ADMIN')],
  }, async (request, reply) => {
    const { id } = request.params
    const parsed = updateUserSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ message: parsed.error.errors[0].message })
    }

    const actor = request.user as { sub: string }

    // Prevent admin from deactivating themselves
    if (id === actor.sub && parsed.data.isActive === false) {
      return reply.status(400).send({ message: 'You cannot deactivate your own account.' })
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        name: parsed.data.name,
        isActive: parsed.data.isActive,
        ...(parsed.data.role ? { role: parsed.data.role } : {}),
      },
      select: { id: true, email: true, name: true, role: true, isActive: true },
    })

    await prisma.auditLog.create({
      data: {
        userId: actor.sub,
        action: 'user.update',
        resource: 'users',
        resourceId: id,
        newValue: JSON.stringify(parsed.data),
        ipAddress: request.ip,
      },
    })

    return reply.send(user)
  })

  // ── DELETE /api/users/:id — admin only ────────────────────────
  app.delete<{ Params: { id: string } }>('/:id', {
    preHandler: [authenticate, requireRole('ADMIN')],
  }, async (request, reply) => {
    const { id } = request.params
    const actor = request.user as { sub: string }

    if (id === actor.sub) {
      return reply.status(400).send({ message: 'You cannot delete your own account.' })
    }

    await prisma.user.delete({ where: { id } })

    await prisma.auditLog.create({
      data: {
        userId: actor.sub,
        action: 'user.delete',
        resource: 'users',
        resourceId: id,
        ipAddress: request.ip,
      },
    })

    return reply.send({ message: 'User deleted.' })
  })

  // ── GET /api/users/audit-log — admin only ─────────────────────
  app.get('/audit-log', {
    preHandler: [authenticate, requireRole('ADMIN')],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const query = request.query as { page?: string }
    const page = Math.max(1, Number(query.page) || 1)
    const limit = 50

    const logs = await prisma.auditLog.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
      },
    })

    return reply.send(logs)
  })
}
