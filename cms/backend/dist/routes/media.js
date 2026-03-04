"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaRoutes = mediaRoutes;
const cloudinary_1 = require("cloudinary");
const uuid_1 = require("uuid");
const db_1 = require("../plugins/db");
const auth_1 = require("../middleware/auth");
// ─── Allowed MIME types ───────────────────────────────────────
const ALLOWED_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'application/pdf',
]);
// ─── Configure Cloudinary ─────────────────────────────────────
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});
// ─────────────────────────────────────────────────────────────
async function mediaRoutes(app) {
    // ── GET /api/media — list all media ──────────────────────────
    app.get('/', {
        preHandler: [auth_1.authenticate, (0, auth_1.requireRole)('ADMIN', 'EDITOR')],
    }, async (request, reply) => {
        const query = request.query;
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.min(50, Math.max(1, Number(query.limit) || 20));
        const [media, total] = await db_1.prisma.$transaction([
            db_1.prisma.media.findMany({
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            db_1.prisma.media.count(),
        ]);
        return reply.send({
            data: media,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        });
    });
    // ── POST /api/media/upload ────────────────────────────────────
    app.post('/upload', {
        preHandler: [auth_1.authenticate, (0, auth_1.requireRole)('ADMIN', 'EDITOR')],
    }, async (request, reply) => {
        const data = await request.file();
        if (!data) {
            return reply.status(400).send({ message: 'No file uploaded.' });
        }
        // ── Read into buffer for magic-byte validation ─────────────
        const buffer = await data.toBuffer();
        // ── Validate file type by magic bytes (not extension/header) ─
        // Dynamic import for file-type (ESM-only package in CommonJS context)
        let mimeType = null;
        try {
            // file-type v16 (CommonJS compat) exports `fromBuffer`, not `fileTypeFromBuffer`
            const fileTypeMod = await Promise.resolve().then(() => __importStar(require('file-type')));
            const fromBuffer = fileTypeMod.fromBuffer ?? fileTypeMod.default?.fromBuffer;
            const detectedType = fromBuffer ? await fromBuffer(buffer) : null;
            // SVGs won't be detected by file-type (they're XML text) — handle separately
            mimeType = detectedType?.mime ?? (data.mimetype === 'image/svg+xml' ? 'image/svg+xml' : null);
        }
        catch {
            // Fall back to Content-Type header if file-type module fails
            mimeType = ALLOWED_MIME_TYPES.has(data.mimetype) ? data.mimetype : null;
        }
        if (!mimeType || !ALLOWED_MIME_TYPES.has(mimeType)) {
            return reply.status(400).send({
                message: `File type not allowed. Allowed: ${[...ALLOWED_MIME_TYPES].join(', ')}`,
            });
        }
        // ── Generate safe filename — never use original ────────────
        const extension = mimeType.split('/')[1]?.replace('jpeg', 'jpg') ?? 'bin';
        const safeFilename = `${(0, uuid_1.v4)()}.${extension}`;
        // ── Upload to Cloudinary as a stream ──────────────────────
        let uploadResult;
        try {
            uploadResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                    folder: 'nua-cms',
                    public_id: safeFilename.split('.')[0],
                    resource_type: 'auto',
                    // Force download — prevents browser executing uploaded files
                    type: 'upload',
                }, (error, result) => {
                    if (error || !result)
                        return reject(error);
                    resolve(result);
                });
                uploadStream.end(buffer);
            });
        }
        catch (err) {
            app.log.error(err);
            return reply.status(500).send({ message: 'Upload failed. Please try again.' });
        }
        const media = await db_1.prisma.media.create({
            data: {
                filename: safeFilename,
                originalName: data.filename.slice(0, 255), // cap length
                mimeType,
                size: buffer.length,
                url: uploadResult.secure_url,
                publicId: uploadResult.public_id,
                width: uploadResult.width,
                height: uploadResult.height,
            },
        });
        const user = request.user;
        await db_1.prisma.auditLog.create({
            data: {
                userId: user.sub,
                action: 'media.upload',
                resource: 'media',
                resourceId: media.id,
                newValue: JSON.stringify({ filename: safeFilename, mimeType, size: buffer.length }),
                ipAddress: request.ip,
            },
        });
        return reply.status(201).send(media);
    });
    // ── PATCH /api/media/:id — update alt text ─────────────────
    app.patch('/:id', {
        preHandler: [auth_1.authenticate, (0, auth_1.requireRole)('ADMIN', 'EDITOR')],
    }, async (request, reply) => {
        const { id } = request.params;
        const body = request.body;
        const alt = typeof body?.alt === 'string' ? body.alt.slice(0, 255) : undefined;
        const media = await db_1.prisma.media.update({
            where: { id },
            data: { alt },
        });
        return reply.send(media);
    });
    // ── DELETE /api/media/:id — admin only ───────────────────────
    app.delete('/:id', {
        preHandler: [auth_1.authenticate, (0, auth_1.requireRole)('ADMIN')],
    }, async (request, reply) => {
        const { id } = request.params;
        const media = await db_1.prisma.media.findUnique({ where: { id } });
        if (!media)
            return reply.status(404).send({ message: 'Media not found.' });
        // Delete from Cloudinary first
        try {
            await cloudinary_1.v2.uploader.destroy(media.publicId);
        }
        catch (err) {
            app.log.warn(`Cloudinary delete failed for ${media.publicId}: ${err}`);
        }
        await db_1.prisma.media.delete({ where: { id } });
        const user = request.user;
        await db_1.prisma.auditLog.create({
            data: {
                userId: user.sub,
                action: 'media.delete',
                resource: 'media',
                resourceId: id,
                oldValue: JSON.stringify({ filename: media.filename, url: media.url }),
                ipAddress: request.ip,
            },
        });
        return reply.send({ message: 'Media deleted.' });
    });
}
//# sourceMappingURL=media.js.map