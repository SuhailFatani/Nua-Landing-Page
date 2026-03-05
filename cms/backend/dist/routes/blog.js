"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blogRoutes = blogRoutes;
const zod_1 = require("zod");
const db_1 = require("../plugins/db");
const auth_1 = require("../middleware/auth");
const sanitize_1 = require("../utils/sanitize");
const slug_1 = require("../utils/slug");
const createPostSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(200),
    excerpt: zod_1.z.string().max(500).optional(),
    content: zod_1.z.string().min(1), // Rich text HTML — sanitized on server
    coverImageId: zod_1.z.string().uuid().nullable().optional(), // null = remove cover image
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    metaTitle: zod_1.z.string().max(160).optional(),
    metaDesc: zod_1.z.string().max(320).optional(),
    status: zod_1.z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
    scheduledAt: zod_1.z.string().datetime().optional(),
});
const updatePostSchema = createPostSchema.partial();
const listQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(50).default(10),
    status: zod_1.z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
    tag: zod_1.z.string().optional(),
    search: zod_1.z.string().max(100).optional(),
});
// ─────────────────────────────────────────────────────────────
async function blogRoutes(app) {
    // ── GET /api/blog — public ────────────────────────────────────
    app.get('/', async (request, reply) => {
        const parsed = listQuerySchema.safeParse(request.query);
        if (!parsed.success) {
            return reply.status(400).send({ message: 'Invalid query parameters.' });
        }
        const { page, limit, tag, search } = parsed.data;
        const skip = (page - 1) * limit;
        const where = {
            status: 'PUBLISHED',
            publishedAt: { lte: new Date() },
            ...(tag ? { tags: { some: { tag: { slug: tag } } } } : {}),
            ...(search ? {
                OR: [
                    { title: { contains: search, mode: 'default' } },
                    { excerpt: { contains: search, mode: 'default' } },
                ],
            } : {}),
        };
        const [posts, total] = await db_1.prisma.$transaction([
            db_1.prisma.blogPost.findMany({
                where,
                skip,
                take: limit,
                orderBy: { publishedAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    excerpt: true,
                    coverImage: { select: { url: true, alt: true } },
                    author: { select: { name: true, avatarUrl: true } },
                    tags: { select: { tag: { select: { name: true, slug: true } } } },
                    publishedAt: true,
                    viewCount: true,
                },
            }),
            db_1.prisma.blogPost.count({ where }),
        ]);
        return reply.send({
            data: posts,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        });
    });
    // ── GET /api/blog/:slug — public ──────────────────────────────
    app.get('/:slug', async (request, reply) => {
        const { slug } = request.params;
        const post = await db_1.prisma.blogPost.findUnique({
            where: { slug },
            include: {
                author: { select: { name: true, avatarUrl: true } },
                coverImage: { select: { url: true, alt: true, width: true, height: true } },
                tags: { select: { tag: { select: { name: true, slug: true } } } },
            },
        });
        if (!post || post.status !== 'PUBLISHED' || (post.publishedAt && post.publishedAt > new Date())) {
            return reply.status(404).send({ message: 'Post not found.' });
        }
        // Increment view count (fire and forget — don't block response)
        db_1.prisma.blogPost.update({
            where: { id: post.id },
            data: { viewCount: { increment: 1 } },
        }).catch(() => { });
        return reply.send(post);
    });
    // ── GET /api/blog/admin/all — editor/admin ────────────────────
    app.get('/admin/all', {
        preHandler: [auth_1.authenticate, (0, auth_1.requireRole)('ADMIN', 'EDITOR')],
    }, async (request, reply) => {
        const parsed = listQuerySchema.safeParse(request.query);
        if (!parsed.success) {
            return reply.status(400).send({ message: 'Invalid query parameters.' });
        }
        const { page, limit, status, search } = parsed.data;
        const skip = (page - 1) * limit;
        const where = {
            ...(status ? { status: status } : {}),
            ...(search ? {
                OR: [
                    { title: { contains: search, mode: 'default' } },
                    { excerpt: { contains: search, mode: 'default' } },
                ],
            } : {}),
        };
        const [posts, total] = await db_1.prisma.$transaction([
            db_1.prisma.blogPost.findMany({
                where,
                skip,
                take: limit,
                orderBy: { updatedAt: 'desc' },
                include: {
                    author: { select: { name: true, avatarUrl: true } },
                    tags: { select: { tag: { select: { name: true } } } },
                    coverImage: { select: { url: true, alt: true } },
                },
            }),
            db_1.prisma.blogPost.count({ where }),
        ]);
        return reply.send({
            data: posts,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        });
    });
    // ── POST /api/blog — create post ──────────────────────────────
    app.post('/', {
        preHandler: [auth_1.authenticate, (0, auth_1.requireRole)('ADMIN', 'EDITOR')],
    }, async (request, reply) => {
        const parsed = createPostSchema.safeParse(request.body);
        if (!parsed.success) {
            return reply.status(400).send({ message: parsed.error.errors[0].message });
        }
        const user = request.user;
        const { title, content, tags, status, scheduledAt, ...rest } = parsed.data;
        // Sanitize HTML content — prevent XSS from rich text editor
        const safeContent = (0, sanitize_1.sanitizeHtml)(content);
        // Auto-generate unique slug
        const baseSlug = (0, slug_1.generateSlug)(title);
        const existingCount = await db_1.prisma.blogPost.count({
            where: { slug: { startsWith: baseSlug } },
        });
        const slug = existingCount === 0 ? baseSlug : `${baseSlug}-${existingCount + 1}`;
        // Upsert tags
        const tagRecords = await Promise.all((tags ?? []).map(name => db_1.prisma.tag.upsert({
            where: { slug: (0, slug_1.generateSlug)(name) },
            update: {},
            create: { name, slug: (0, slug_1.generateSlug)(name) },
        })));
        const post = await db_1.prisma.blogPost.create({
            data: {
                title,
                slug,
                content: safeContent,
                ...rest,
                status: status,
                authorId: user.sub,
                publishedAt: status === 'PUBLISHED' ? new Date() : null,
                scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
                tags: {
                    create: tagRecords.map(t => ({ tagId: t.id })),
                },
            },
            include: {
                author: { select: { name: true } },
                tags: { select: { tag: { select: { name: true, slug: true } } } },
            },
        });
        await db_1.prisma.auditLog.create({
            data: {
                userId: user.sub,
                action: 'post.create',
                resource: 'blog_posts',
                resourceId: post.id,
                // JSON.stringify because SQLite stores as TEXT
                newValue: JSON.stringify({ title, slug, status }),
                ipAddress: request.ip,
            },
        });
        return reply.status(201).send(post);
    });
    // ── PATCH /api/blog/:id — update post ────────────────────────
    app.patch('/:id', {
        preHandler: [auth_1.authenticate, (0, auth_1.requireRole)('ADMIN', 'EDITOR')],
    }, async (request, reply) => {
        const { id } = request.params;
        const parsed = updatePostSchema.safeParse(request.body);
        if (!parsed.success) {
            return reply.status(400).send({ message: parsed.error.errors[0].message });
        }
        const user = request.user;
        const existing = await db_1.prisma.blogPost.findUnique({ where: { id } });
        if (!existing) {
            return reply.status(404).send({ message: 'Post not found.' });
        }
        // Editors can only edit their own posts; admins can edit any
        if (user.role === 'EDITOR' && existing.authorId !== user.sub) {
            return reply.status(403).send({ message: 'You can only edit your own posts.' });
        }
        const { content, tags, status, scheduledAt, ...rest } = parsed.data;
        const tagRecords = tags
            ? await Promise.all(tags.map(name => db_1.prisma.tag.upsert({
                where: { slug: (0, slug_1.generateSlug)(name) },
                update: {},
                create: { name, slug: (0, slug_1.generateSlug)(name) },
            })))
            : undefined;
        const updated = await db_1.prisma.blogPost.update({
            where: { id },
            data: {
                ...rest,
                ...(content ? { content: (0, sanitize_1.sanitizeHtml)(content) } : {}),
                ...(status ? {
                    status: status,
                    publishedAt: status === 'PUBLISHED' && !existing.publishedAt ? new Date() : existing.publishedAt,
                } : {}),
                ...(scheduledAt ? { scheduledAt: new Date(scheduledAt) } : {}),
                ...(tagRecords ? {
                    tags: {
                        deleteMany: {},
                        create: tagRecords.map(t => ({ tagId: t.id })),
                    },
                } : {}),
            },
            include: {
                author: { select: { name: true } },
                tags: { select: { tag: { select: { name: true, slug: true } } } },
            },
        });
        await db_1.prisma.auditLog.create({
            data: {
                userId: user.sub,
                action: 'post.update',
                resource: 'blog_posts',
                resourceId: id,
                oldValue: JSON.stringify({ title: existing.title, status: existing.status }),
                newValue: JSON.stringify({ title: updated.title, status: updated.status }),
                ipAddress: request.ip,
            },
        });
        return reply.send(updated);
    });
    // ── DELETE /api/blog/:id — admin only ────────────────────────
    app.delete('/:id', {
        preHandler: [auth_1.authenticate, (0, auth_1.requireRole)('ADMIN')],
    }, async (request, reply) => {
        const { id } = request.params;
        const user = request.user;
        const post = await db_1.prisma.blogPost.findUnique({ where: { id } });
        if (!post)
            return reply.status(404).send({ message: 'Post not found.' });
        await db_1.prisma.blogPost.delete({ where: { id } });
        await db_1.prisma.auditLog.create({
            data: {
                userId: user.sub,
                action: 'post.delete',
                resource: 'blog_posts',
                resourceId: id,
                oldValue: JSON.stringify({ title: post.title, slug: post.slug }),
                ipAddress: request.ip,
            },
        });
        return reply.send({ message: 'Post deleted.' });
    });
}
//# sourceMappingURL=blog.js.map