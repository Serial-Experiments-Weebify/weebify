import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import express from "express";

type ClassConstructor<T> = {
    new (...args: any[]): T;
};

export async function validateJsonBody<T extends Object>(
    constructor: ClassConstructor<T>,
    req: express.Request,
    res: express.Response
): Promise<T | null> {
    const body = req.body;

    if (!body) {
        res.status(400).json({ error: "Bad request" });
        return null;
    }

    const instance = plainToInstance(constructor, body);
    const errors = await validate(instance);

    if (errors.length > 0) {
        res.status(400).json({ error: "Bad request", errors });
        return null;
    }

    return instance;
}
