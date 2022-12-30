import { UserDocument, users } from './user.model';
import { Request, Response, NextFunction } from "express"

export interface AuthenticatedRequest extends Request {
    user: UserDocument;
}

const TOKEN_REGEX = /Bearer ([a-z0-9_-]+)/i;

export async function AuthenticateUserByPfpToken(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['authorization']?.match(TOKEN_REGEX)?.[1];
    if (!token) return res.status(401).send({ error: 'Unauthorized' });

    const user = await users.findOne({ pfpToken: token });
    if (!user) return res.status(401).send({ error: 'Unauthorized' });
    
    //@ts-ignore
    req.user = user;
    next();
}