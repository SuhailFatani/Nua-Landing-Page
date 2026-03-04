import { FastifyRequest, FastifyReply } from 'fastify';
type UserRole = string;
export declare function authenticate(request: FastifyRequest, reply: FastifyReply): Promise<undefined>;
export declare function requireRole(...roles: UserRole[]): (request: FastifyRequest, reply: FastifyReply) => Promise<undefined>;
declare module '@fastify/jwt' {
    interface FastifyJWT {
        payload: {
            sub: string;
            email: string;
            role: UserRole;
            name: string;
        };
        user: {
            sub: string;
            email: string;
            role: UserRole;
            name: string;
        };
    }
}
export {};
//# sourceMappingURL=auth.d.ts.map