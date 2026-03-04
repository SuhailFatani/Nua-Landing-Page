"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = authRoutes;
const argon2_1 = __importDefault(require("argon2"));
const zod_1 = require("zod");
const crypto_1 = require("crypto");
const db_1 = require("../plugins/db");
const auth_1 = require("../middleware/auth");
// ─── Argon2id config (OWASP 2025 minimum) ────────────────────
const ARGON2_OPTIONS = {
    type: argon2_1.default.argon2id,
    memoryCost: 19456, // 19 MiB
    timeCost: 2,
    parallelism: 1,
};
// ─── Token config ─────────────────────────────────────────────
const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
// ─── Validation schemas ───────────────────────────────────────
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email().toLowerCase(),
    password: zod_1.z.string().min(8).max(128),
});
const changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(8).max(128),
    newPassword: zod_1.z
        .string()
        .min(12, 'Password must be at least 12 characters')
        .max(128)
        .regex(/[A-Z]/, 'Must contain uppercase letter')
        .regex(/[a-z]/, 'Must contain lowercase letter')
        .regex(/[0-9]/, 'Must contain a number')
        .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
});
// ─── Helpers ──────────────────────────────────────────────────
function hashToken(token) {
    return (0, crypto_1.createHash)('sha256').update(token).digest('hex');
}
function generateRefreshToken() {
    return (0, crypto_1.randomBytes)(48).toString('hex');
}
function getRefreshCookieOptions(isProd) {
    return {
        httpOnly: true, // JS cannot read — XSS-proof
        secure: isProd, // HTTPS only in production
        sameSite: 'strict', // CSRF protection
        path: '/api/auth', // Only sent to auth routes
        maxAge: REFRESH_TOKEN_TTL_MS / 1000,
    };
}
// ─────────────────────────────────────────────────────────────
async function authRoutes(app) {
    // ── POST /api/auth/login ─────────────────────────────────────
    app.post('/login', {
        config: {
            rateLimit: {
                max: 5, // 5 attempts per 15 min — brute force protection
                timeWindow: '15 minutes',
                ban: 3, // ban IP after 3 rate limit violations
            },
        },
    }, async (request, reply) => {
        const parsed = loginSchema.safeParse(request.body);
        if (!parsed.success) {
            return reply.status(400).send({ statusCode: 400, message: 'Invalid credentials.' });
        }
        const { email, password } = parsed.data;
        const ip = request.ip;
        const isProd = process.env.NODE_ENV === 'production';
        const user = await db_1.prisma.user.findUnique({ where: { email } });
        // ── Account lockout check ──────────────────────────────────
        if (user?.lockedUntil && user.lockedUntil > new Date()) {
            return reply.status(403).send({
                statusCode: 403,
                message: 'Account temporarily locked. Try again in 15 minutes.',
            });
        }
        // ── Verify password ────────────────────────────────────────
        // Always run argon2.verify even if user not found — prevents timing attacks
        const dummyHash = '$argon2id$v=19$m=19456,t=2,p=1$invalidsalt$invalidhash';
        const passwordValid = user
            ? await argon2_1.default.verify(user.passwordHash, password, ARGON2_OPTIONS)
            : await argon2_1.default.verify(dummyHash, password).catch(() => false);
        if (!user || !passwordValid || !user.isActive) {
            // Increment failed attempts if user exists
            if (user) {
                const failedAttempts = user.failedLoginAttempts + 1;
                await db_1.prisma.user.update({
                    where: { id: user.id },
                    data: {
                        failedLoginAttempts: failedAttempts,
                        lockedUntil: failedAttempts >= MAX_FAILED_ATTEMPTS
                            ? new Date(Date.now() + LOCKOUT_DURATION_MS)
                            : null,
                    },
                });
            }
            // Generic error — never reveal if email exists
            return reply.status(401).send({
                statusCode: 401,
                message: 'Invalid email or password.',
            });
        }
        // ── Issue tokens ───────────────────────────────────────────
        const accessToken = app.jwt.sign({ sub: user.id, email: user.email, role: user.role, name: user.name }, { expiresIn: ACCESS_TOKEN_TTL });
        const refreshToken = generateRefreshToken();
        const family = (0, crypto_1.randomBytes)(16).toString('hex');
        await db_1.prisma.$transaction([
            // Store hashed refresh token — never store plaintext
            db_1.prisma.refreshToken.create({
                data: {
                    tokenHash: hashToken(refreshToken),
                    userId: user.id,
                    family,
                    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
                },
            }),
            // Reset failed attempts on successful login
            db_1.prisma.user.update({
                where: { id: user.id },
                data: {
                    failedLoginAttempts: 0,
                    lockedUntil: null,
                    lastLoginAt: new Date(),
                    lastLoginIp: ip,
                },
            }),
        ]);
        await db_1.prisma.auditLog.create({
            data: {
                userId: user.id,
                action: 'auth.login',
                resource: 'users',
                resourceId: user.id,
                ipAddress: ip,
                userAgent: request.headers['user-agent'],
            },
        });
        // Set refresh token in httpOnly cookie — never in response body
        reply.setCookie('refresh_token', refreshToken, getRefreshCookieOptions(isProd));
        return reply.send({
            accessToken,
            user: { id: user.id, email: user.email, name: user.name, role: user.role, avatarUrl: user.avatarUrl },
        });
    });
    // ── POST /api/auth/refresh ────────────────────────────────────
    app.post('/refresh', async (request, reply) => {
        const refreshToken = request.cookies.refresh_token;
        const isProd = process.env.NODE_ENV === 'production';
        if (!refreshToken) {
            return reply.status(401).send({ statusCode: 401, message: 'No refresh token.' });
        }
        const tokenHash = hashToken(refreshToken);
        const stored = await db_1.prisma.refreshToken.findUnique({
            where: { tokenHash },
            include: { user: true },
        });
        // ── Token reuse detection (theft signal) ─────────────────
        if (!stored) {
            // If the token hash doesn't exist, it was already rotated — possible theft
            // Find by family and revoke all tokens in that family
            reply.clearCookie('refresh_token', { path: '/api/auth' });
            return reply.status(401).send({ statusCode: 401, message: 'Invalid refresh token.' });
        }
        if (stored.revokedAt || stored.expiresAt < new Date()) {
            // Revoke entire family — token reuse detected
            await db_1.prisma.refreshToken.updateMany({
                where: { family: stored.family },
                data: { revokedAt: new Date() },
            });
            reply.clearCookie('refresh_token', { path: '/api/auth' });
            return reply.status(401).send({ statusCode: 401, message: 'Session expired. Please log in again.' });
        }
        const user = stored.user;
        if (!user.isActive) {
            return reply.status(403).send({ statusCode: 403, message: 'Account is deactivated.' });
        }
        // ── Rotate: revoke old, issue new ─────────────────────────
        const newRefreshToken = generateRefreshToken();
        await db_1.prisma.$transaction([
            db_1.prisma.refreshToken.update({
                where: { id: stored.id },
                data: { revokedAt: new Date() },
            }),
            db_1.prisma.refreshToken.create({
                data: {
                    tokenHash: hashToken(newRefreshToken),
                    userId: user.id,
                    family: stored.family, // same family for theft detection
                    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
                },
            }),
        ]);
        const accessToken = app.jwt.sign({ sub: user.id, email: user.email, role: user.role, name: user.name }, { expiresIn: ACCESS_TOKEN_TTL });
        reply.setCookie('refresh_token', newRefreshToken, getRefreshCookieOptions(isProd));
        return reply.send({ accessToken });
    });
    // ── POST /api/auth/logout ─────────────────────────────────────
    app.post('/logout', { preHandler: [auth_1.authenticate] }, async (request, reply) => {
        const refreshToken = request.cookies.refresh_token;
        if (refreshToken) {
            await db_1.prisma.refreshToken.updateMany({
                where: { tokenHash: hashToken(refreshToken) },
                data: { revokedAt: new Date() },
            });
        }
        reply.clearCookie('refresh_token', { path: '/api/auth' });
        const user = request.user;
        await db_1.prisma.auditLog.create({
            data: {
                userId: user.sub,
                action: 'auth.logout',
                resource: 'users',
                resourceId: user.sub,
                ipAddress: request.ip,
            },
        });
        return reply.send({ message: 'Logged out successfully.' });
    });
    // ── POST /api/auth/logout-all ─────────────────────────────────
    // Revoke ALL sessions — useful when password is compromised
    app.post('/logout-all', { preHandler: [auth_1.authenticate] }, async (request, reply) => {
        const user = request.user;
        await db_1.prisma.refreshToken.updateMany({
            where: { userId: user.sub, revokedAt: null },
            data: { revokedAt: new Date() },
        });
        reply.clearCookie('refresh_token', { path: '/api/auth' });
        return reply.send({ message: 'All sessions revoked.' });
    });
    // ── GET /api/auth/me ──────────────────────────────────────────
    app.get('/me', { preHandler: [auth_1.authenticate] }, async (request, reply) => {
        const user = request.user;
        const profile = await db_1.prisma.user.findUnique({
            where: { id: user.sub },
            select: { id: true, email: true, name: true, role: true, avatarUrl: true, lastLoginAt: true },
        });
        if (!profile) {
            return reply.status(404).send({ statusCode: 404, message: 'User not found.' });
        }
        return reply.send(profile);
    });
    // ── POST /api/auth/change-password ───────────────────────────
    app.post('/change-password', { preHandler: [auth_1.authenticate] }, async (request, reply) => {
        const parsed = changePasswordSchema.safeParse(request.body);
        if (!parsed.success) {
            return reply.status(400).send({
                statusCode: 400,
                message: parsed.error.errors[0].message,
            });
        }
        const { currentPassword, newPassword } = parsed.data;
        const currentUser = request.user;
        const user = await db_1.prisma.user.findUnique({ where: { id: currentUser.sub } });
        if (!user)
            return reply.status(404).send({ message: 'User not found.' });
        const valid = await argon2_1.default.verify(user.passwordHash, currentPassword, ARGON2_OPTIONS);
        if (!valid) {
            return reply.status(401).send({ statusCode: 401, message: 'Current password is incorrect.' });
        }
        const newHash = await argon2_1.default.hash(newPassword, ARGON2_OPTIONS);
        // Invalidate ALL sessions when password changes
        await db_1.prisma.$transaction([
            db_1.prisma.user.update({
                where: { id: user.id },
                data: { passwordHash: newHash },
            }),
            db_1.prisma.refreshToken.updateMany({
                where: { userId: user.id, revokedAt: null },
                data: { revokedAt: new Date() },
            }),
        ]);
        reply.clearCookie('refresh_token', { path: '/api/auth' });
        await db_1.prisma.auditLog.create({
            data: {
                userId: user.id,
                action: 'auth.password_changed',
                resource: 'users',
                resourceId: user.id,
                ipAddress: request.ip,
            },
        });
        return reply.send({ message: 'Password changed. Please log in again.' });
    });
}
//# sourceMappingURL=auth.js.map