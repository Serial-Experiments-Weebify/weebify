import { Request } from 'express';
import { AuthService } from './auth.service';

/*
    Middleware that puts the user object on the request object
*/

export const authenticateUser = async (
    authService: AuthService,
    request: Request,
) => {
    const token = request.headers.authorization?.replace('Bearer ', '');
    const mt = await authService.matchToken(token);
    const sid = mt.session;
    console.log({ mt, sid });
    if (!mt.user || !sid) return mt;

    const session = mt.user.sessions.find((s) => s.id.equals(sid));

    if (!session) return mt;

    if (
        // only update once per minute, or if request source changes
        session.ipAddress != request.ip ||
        session.userAgent != request.headers['user-agent'] ||
        session.lastAccessed < new Date(Date.now() - 60_000)
    ) {
        authService.updateSession(
            mt.user.id,
            sid,
            request.ip ?? '<unknown>',
            request.headers['user-agent'] ?? '<unknown>',
        );
    }

    return mt;
};
