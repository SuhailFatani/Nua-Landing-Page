"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRoutes = usersRoutes;
const argon2_1 = __importDefault(require("argon2"));
const zod_1 = require("zod");
// Role values stored as strings: 'ADMIN' | 'EDITOR' | 'VIEWER'
const db_1 = require("../plugins/db");
const auth_1 = require("../middleware/auth");
const ARGON2_OPTIONS = {
    type: argon2_1.default.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
};
const createUserSchema = zod_1.z.object({
    email: zod_1.z.string().email().toLowerCase(),
    name: zod_1.z.string().min(1).max(100),
    password: zod_1.z
        .string()
        .min(12, 'Password must be at least 12 characters')
        .max(128)
        .regex(/[A-Z]/, 'Must contain uppercase letter')
        .regex(/[a-z]/, 'Must contain lowercase letter')
        .regex(/[0-9]/, 'Must contain a number')
        .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
    role: zod_1.z.enum(['ADMIN', 'EDITOR', 'VIEWER']).default('EDITOR'),
});
const updateUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100).optional(),
    role: zod_1.z.enum(['ADMIN', 'EDITOR', 'VIEWER']).optional(),
    isActive: zod_1.z.boolean().optional(),
});
// ─────────────────────────────────────────────────────────────
async function usersRoutes(app) {
    // ── GET /api/users — admin only ───────────────────────────────
    app.get('/', {
        preHandler: [auth_1.authenticate, (0, auth_1.requireRole)('ADMIN')],
    }, async (_request, reply) => {
        const users = await db_1.prisma.user.findMany({
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
        });
        return reply.send(users);
    });
    // ── POST /api/users — admin only — invite team member ─────────
    app.post('/', {
        preHandler: [auth_1.authenticate, (0, auth_1.requireRole)('ADMIN')],
    }, async (request, reply) => {
        const parsed = createUserSchema.safeParse(request.body);
        if (!parsed.success) {
            return reply.status(400).send({ message: parsed.error.errors[0].message });
        }
        const { email, name, password, role } = parsed.data;
        const actor = request.user;
        const exists = await db_1.prisma.user.findUnique({ where: { email } });
        if (exists) {
            return reply.status(409).send({ message: 'Email already in use.' });
        }
        const passwordHash = await argon2_1.default.hash(password, ARGON2_OPTIONS);
        const user = await db_1.prisma.user.create({
            data: { email, name, passwordHash, role: role },
            select: { id: true, email: true, name: true, role: true, createdAt: true },
        });
        await db_1.prisma.auditLog.create({
            data: {
                userId: actor.sub,
                action: 'user.create',
                resource: 'users',
                resourceId: user.id,
                newValue: JSON.stringify({ email, name, role }),
                ipAddress: request.ip,
            },
        });
        return reply.status(201).send(user);
    });
    // ── PATCH /api/users/:id — admin only ─────────────────────────
    app.patch('/:id', {
        preHandler: [auth_1.authenticate, (0, auth_1.requireRole)('ADMIN')],
    }, async (request, reply) => {
        const { id } = request.params;
        const parsed = updateUserSchema.safeParse(request.body);
        if (!parsed.success) {
            return reply.status(400).send({ message: parsed.error.errors[0].message });
        }
        const actor = request.user;
        // Prevent admin from deactivating themselves
        if (id === actor.sub && parsed.data.isActive === false) {
            return reply.status(400).send({ message: 'You cannot deactivate your own account.' });
        }
        const user = await db_1.prisma.user.update({
            where: { id },
            data: {
                name: parsed.data.name,
                isActive: parsed.data.isActive,
                ...(parsed.data.role ? { role: parsed.data.role } : {}),
            },
            select: { id: true, email: true, name: true, role: true, isActive: true },
        });
        await db_1.prisma.auditLog.create({
            data: {
                userId: actor.sub,
                action: 'user.update',
                resource: 'users',
                resourceId: id,
                newValue: JSON.stringify(parsed.data),
                ipAddress: request.ip,
            },
        });
        return reply.send(user);
    });
    // ── DELETE /api/users/:id — admin only ────────────────────────
    app.delete('/:id', {
        preHandler: [auth_1.authenticate, (0, auth_1.requireRole)('ADMIN')],
    }, async (request, reply) => {
        const { id } = request.params;
        const actor = request.user;
        if (id === actor.sub) {
            return reply.status(400).send({ message: 'You cannot delete your own account.' });
        }
        await db_1.prisma.user.delete({ where: { id } });
        await db_1.prisma.auditLog.create({
            data: {
                userId: actor.sub,
                action: 'user.delete',
                resource: 'users',
                resourceId: id,
                ipAddress: request.ip,
            },
        });
        return reply.send({ message: 'User deleted.' });
    });
    // ── GET /api/users/audit-log — admin only ─────────────────────
    app.get('/audit-log', {
        preHandler: [auth_1.authenticate, (0, auth_1.requireRole)('ADMIN')],
    }, async (request, reply) => {
        const query = request.query;
        const page = Math.max(1, Number(query.page) || 1);
        const limit = 50;
        const logs = await db_1.prisma.auditLog.findMany({
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { name: true, email: true } },
            },
        });
        return reply.send(logs);
    });
}
//# sourceMappingURL=users.js.map