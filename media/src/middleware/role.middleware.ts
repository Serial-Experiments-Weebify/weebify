import { NextFunction, Request, Response } from 'express';
import { UserDocument, UserRole } from '../models/user.model';

export function RoleGuard(...roles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user as UserDocument;

        // API keys don't have roles
        const apikey = (req as any).apikey ?? (false as boolean);

        if (!user && !apikey)
            return res.status(401).send({ error: 'Unauthorized' });

        if (apikey) return next();
        if (roles.includes(user.role)) return next();

        return res.status(403).send({ error: 'Forbidden' });
    };
}
