import { Request, Response, NextFunction } from 'express';
import { APIKeyModel } from '../models/apiKey.model';
import { verify } from 'jsonwebtoken';
import Container from 'typedi';
import { ConfigService } from '../services/config.service';
import { UserDocument, UserModel } from '../models/user.model';

const conf = Container.get(ConfigService);
const TOKEN_REGEX = /Bearer ([a-z0-9_-]+)/i;

function verifyWeebifyJWT(jwt: string): Promise<{ uid: string; sid: string }> {
    return new Promise((resolve, reject) => {
        verify(jwt, conf.vars.AUTH_JWT_KEY, (err, decoded) => {
            if (err) return reject(err);

            if (typeof decoded !== 'object') return reject('Invalid JWT');

            if (
                typeof decoded?.uid !== 'string' ||
                typeof decoded?.sid !== 'string'
            )
                reject('Invalid JWT');

            resolve(decoded as any);
        });
    });
}

async function checkUserAuth(jwt: string): Promise<UserDocument | null> {
    try {
        const { uid, sid } = await verifyWeebifyJWT(jwt);

        const user = await UserModel.findOne({
            _id: uid,
            sessions: { $elemMatch: { _id: sid } },
        });

        if (!user) return null;

        return user;
    } catch {
        return null;
    }
}

async function checkApiKeyAuth(token: string): Promise<boolean> {
    const m = await APIKeyModel.findOne({ key: token });
    if (!m) return false;

    return true;
}

export enum AuthType {
    Any,
    ApiKeyOnly,
    JwtOnly,
}

export function Auth(mode: AuthType = AuthType.Any) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const tokenOrJwt =
            req.headers['authorization']?.match(TOKEN_REGEX)?.[1];

        let isAuthenticated = false;

        if (!tokenOrJwt) return res.status(401).send({ error: 'Unauthorized' });

        if (mode !== AuthType.JwtOnly) {
            if (await checkApiKeyAuth(tokenOrJwt)) isAuthenticated = true;
        }

        if (mode !== AuthType.ApiKeyOnly) {
            const user = await checkUserAuth(tokenOrJwt);
            if (user) {
                isAuthenticated = true;
                (req as any).user = user;
            }
        }

        if (!isAuthenticated) next();
        else res.status(401).send({ error: 'Unauthorized' });
    };
}
