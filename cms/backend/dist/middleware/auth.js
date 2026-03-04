"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.requireRole = requireRole;
// ─────────────────────────────────────────────────────────────
// Attach user from JWT to request — used on protected routes
// ─────────────────────────────────────────────────────────────
async function authenticate(request, reply) {
    try {
        await request.jwtVerify();
    }
    catch {
        return reply.status(401).send({
            statusCode: 401,
            error: 'Unauthorized',
            message: 'Invalid or expired token.',
        });
    }
}
// ─────────────────────────────────────────────────────────────
// Role guard — call after authenticate
// Usage: requireRole('ADMIN') or requireRole('ADMIN', 'EDITOR')
// ─────────────────────────────────────────────────────────────
function requireRole(...roles) {
    return async (request, reply) => {
        const user = request.user;
        if (!user || !roles.includes(user.role)) {
            return reply.status(403).send({
                statusCode: 403,
                error: 'Forbidden',
                message: 'You do not have permission to perform this action.',
            });
        }
    };
}
//# sourceMappingURL=auth.js.map