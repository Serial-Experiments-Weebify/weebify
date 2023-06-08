import { UserModel } from "../models/user.model";
import { Request, Response, NextFunction } from "express";

export interface AuthenticatedRequest extends Request {
    user: typeof UserModel;
}

const TOKEN_REGEX = /Bearer ([a-z0-9_-]+)/i;

export async function AuthenticateUserByPfpToken(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const token = req.headers["authorization"]?.match(TOKEN_REGEX)?.[1];
    if (!token) return res.status(401).send({ error: "Unauthorized" });

    const user = await UserModel.findOne({ pfpToken: token });
    if (!user) return res.status(401).send({ error: "Unauthorized" });

    //@ts-ignore
    req.user = user;
    next();
}
