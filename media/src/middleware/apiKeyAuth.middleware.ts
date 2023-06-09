import { Request, Response, NextFunction } from 'express';
import { APIKeyModel } from '../models/apiKey.model';

const TOKEN_REGEX = /Bearer ([a-z0-9_-]+)/i;

export async function AuthenticateByApiKey(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const token = req.headers['authorization']?.match(TOKEN_REGEX)?.[1];
    if (!token) return res.status(401).send({ error: 'Unauthorized' });

    try {
        const m = await APIKeyModel.findOne({ key: token });
        if (!m) return res.status(401).send({ error: 'Unauthorized' });
    } catch {
        return res.status(500).send({ error: 'Interal Server Error' });
    }

    next();
}
