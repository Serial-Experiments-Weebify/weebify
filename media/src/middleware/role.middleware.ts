import { NextFunction, Request, Response } from 'express';
import { UserDocument, UserRole } from '../models/user.model';

export function RoleGuard(...roles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user as UserDocument;

        if (!user) return res.status(401).send({ error: 'Unauthorized' });

        if (roles.includes(user.role)) next();
        return res.status(403).send({ error: 'Forbidden' });
    };
}
