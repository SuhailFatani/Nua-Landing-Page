import { FastifyRequest, FastifyReply } from 'fastify'

// Role values: 'ADMIN' | 'EDITOR' | 'VIEWER'
type UserRole = string

// ─────────────────────────────────────────────────────────────
// Attach user from JWT to request — used on protected routes
// ─────────────────────────────────────────────────────────────
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    await request.jwtVerify()
  } catch {
    return reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Invalid or expired token.',
    })
  }
}

// ─────────────────────────────────────────────────────────────
// Role guard — call after authenticate
// Usage: requireRole('ADMIN') or requireRole('ADMIN', 'EDITOR')
// ─────────────────────────────────────────────────────────────
export function requireRole(...roles: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { role: UserRole }

    if (!user || !roles.includes(user.role)) {
      return reply.status(403).send({
        statusCode: 403,
        error: 'Forbidden',
        message: 'You do not have permission to perform this action.',
      })
    }
  }
}

// Extend FastifyRequest with our JWT payload shape
declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      sub: string    // user id
      email: string
      role: UserRole
      name: string
    }
    user: {
      sub: string
      email: string
      role: UserRole
      name: string
    }
  }
}
