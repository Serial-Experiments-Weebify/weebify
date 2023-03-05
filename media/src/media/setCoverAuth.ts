import { Request, Response, NextFunction } from "express";
import { MediaDocument, media } from "./media.model";

export interface AuthenticatedRequest extends Request {
    media: MediaDocument;
}

const TOKEN_REGEX = /Bearer ([a-z0-9_-]+)/i;

export async function AuthenticateBySetCoverToken(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const token = req.headers["authorization"]?.match(TOKEN_REGEX)?.[1];
    if (!token) return res.status(401).send({ error: "Unauthorized" });

    const m = await media.findOne({ setCoverToken: token });
    if (!m) return res.status(401).send({ error: "Unauthorized" });

    //@ts-ignore
    req.media = m;
    next();
}
