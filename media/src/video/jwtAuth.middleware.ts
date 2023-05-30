import { Request, Response, NextFunction } from "express";
import Container from "typedi";
import { ConfigService } from "../services/config.service";
import { verify } from "jsonwebtoken";

export interface VideoJwt extends Request {
    media: {
        mid: string;
        eid?: string;
        kind: "TV" | "MOVIE";
    };
}

const TOKEN_REGEX = /Bearer ([a-z0-9_\.-]+)/i;

const key = Container.get(ConfigService).vars.MEDIA_JWT_KEY;

export async function JWTAuth(req: Request, res: Response, next: NextFunction) {
    const token = req.headers["authorization"]?.match(TOKEN_REGEX)?.[1];
    if (!token) return res.status(401).send({ error: "Unauthorized" });

    try {
        const tk = verify(token, key);

        //@ts-ignore
        req.media = tk;
        next();
    } catch (e) {
        return res.status(401).send({ error: "Unauthorized" });
    }
}
