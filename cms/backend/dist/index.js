"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const fastify_1 = __importDefault(require("fastify"));
const cookie_1 = __importDefault(require("@fastify/cookie"));
const cors_1 = __importDefault(require("@fastify/cors"));
const helmet_1 = __importDefault(require("@fastify/helmet"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const rate_limit_1 = __importDefault(require("@fastify/rate-limit"));
const multipart_1 = __importDefault(require("@fastify/multipart"));
const auth_1 = require("./routes/auth");
const pages_1 = require("./routes/pages");
const blog_1 = require("./routes/blog");
const media_1 = require("./routes/media");
const users_1 = require("./routes/users");
const analytics_1 = require("./routes/analytics");
const db_1 = require("./plugins/db");
const PORT = Number(process.env.PORT) || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProd = NODE_ENV === 'production';
// ─────────────────────────────────────────────────────────────
// Wrap everything in async main() — avoids top-level await
// which is incompatible with CommonJS module mode
// ─────────────────────────────────────────────────────────────
async function main() {
    const app = (0, fastify_1.default)({
        logger: {
            level: isProd ? 'warn' : 'info',
            ...(isProd ? {} : { transport: { target: 'pino-pretty' } }),
        },
        bodyLimit: 1_048_576, // Prevent ReDoS — reject bodies > 1MB
    });
    // ─────────────────────────────────────────────────────────────
    // SECURITY HEADERS (Helmet)
    // ─────────────────────────────────────────────────────────────
    await app.register(helmet_1.default, {
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
    });
    // ─────────────────────────────────────────────────────────────
    // CORS
    // ─────────────────────────────────────────────────────────────
    const allowedOrigins = [
        process.env.FRONTEND_URL ?? 'http://localhost:3000',
        process.env.ADMIN_URL ?? 'http://localhost:5500',
    ];
    await app.register(cors_1.default, {
        origin: (origin, cb) => {
            // Allow: no origin, null origin (file:// in browsers), localhost, or whitelisted origins
            if (!origin ||
                origin === 'null' ||
                /^file:\/\//.test(origin) ||
                allowedOrigins.includes(origin)) {
                cb(null, true);
            }
            else {
                cb(new Error('Not allowed by CORS'), false);
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    });
    // ─────────────────────────────────────────────────────────────
    // RATE LIMITING
    // ─────────────────────────────────────────────────────────────
    await app.register(rate_limit_1.default, {
        global: true,
        max: 120,
        timeWindow: '1 minute',
        errorResponseBuilder: () => ({
            statusCode: 429,
            error: 'Too Many Requests',
            message: 'Rate limit exceeded. Try again in a minute.',
        }),
    });
    // ─────────────────────────────────────────────────────────────
    // COOKIES (needed for httpOnly refresh tokens)
    // ─────────────────────────────────────────────────────────────
    await app.register(cookie_1.default, {
        secret: process.env.CSRF_SECRET ?? 'dev-csrf-secret',
    });
    // ─────────────────────────────────────────────────────────────
    // JWT
    // ─────────────────────────────────────────────────────────────
    await app.register(jwt_1.default, {
        secret: process.env.JWT_ACCESS_SECRET ?? 'dev-jwt-secret',
        sign: { expiresIn: '15m' },
    });
    // ─────────────────────────────────────────────────────────────
    // MULTIPART (file uploads — max 10MB)
    // ─────────────────────────────────────────────────────────────
    await app.register(multipart_1.default, {
        limits: {
            fileSize: 10 * 1024 * 1024,
            files: 1,
        },
    });
    // ─────────────────────────────────────────────────────────────
    // ROUTES
    // ─────────────────────────────────────────────────────────────
    await app.register(auth_1.authRoutes, { prefix: '/api/auth' });
    await app.register(pages_1.pagesRoutes, { prefix: '/api/pages' });
    await app.register(blog_1.blogRoutes, { prefix: '/api/blog' });
    await app.register(media_1.mediaRoutes, { prefix: '/api/media' });
    await app.register(users_1.usersRoutes, { prefix: '/api/users' });
    await app.register(analytics_1.analyticsRoutes, { prefix: '/api/analytics' });
    // Health check
    app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));
    // ─────────────────────────────────────────────────────────────
    // GLOBAL ERROR HANDLER
    // ─────────────────────────────────────────────────────────────
    app.setErrorHandler((error, _request, reply) => {
        app.log.error(error);
        if (error.validation) {
            return reply.status(400).send({
                statusCode: 400,
                error: 'Validation Error',
                message: error.message,
            });
        }
        const statusCode = error.statusCode ?? 500;
        return reply.status(statusCode).send({
            statusCode,
            error: statusCode === 500 ? 'Internal Server Error' : error.name,
            message: isProd && statusCode === 500
                ? 'An unexpected error occurred.'
                : error.message,
        });
    });
    // ─────────────────────────────────────────────────────────────
    // START
    // ─────────────────────────────────────────────────────────────
    await app.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`\n🚀 Nua CMS API running on http://localhost:${PORT}`);
    console.log(`📋 Health: http://localhost:${PORT}/health\n`);
    // Graceful shutdown
    const shutdown = async () => {
        await app.close();
        await db_1.prisma.$disconnect();
        process.exit(0);
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
}
// ─────────────────────────────────────────────────────────────
// Run
// ─────────────────────────────────────────────────────────────
main().catch(async (err) => {
    console.error('❌ Failed to start server:', err);
    await db_1.prisma.$disconnect();
    process.exit(1);
});
//# sourceMappingURL=index.js.map