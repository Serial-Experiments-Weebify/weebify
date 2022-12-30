import express from 'express';
import { Container } from "typedi"
import sharp, { Sharp } from 'sharp';
import multer, { memoryStorage } from "multer";
import { v4 as uuid } from 'uuid';

import { UserDocument } from '../user/user.model';
import { S3Service } from '../services/s3.service';
import { AuthenticateUserByPfpToken } from '../user/pfpAuth.middleware';
import { WeebifyImage } from '../util/WeebifyImage';

const s3 = Container.get(S3Service);

const upload = multer({
    storage: memoryStorage(),
    limits: {
        fileSize: 20 << 20, // 20 MiB
        files: 5,
    }
});

export const media = express.Router();

media.post('/pfp', AuthenticateUserByPfpToken, upload.single('pfp'), async (req, res) => {
    //@ts-ignore
    const user: UserDocument = req.user;
    const file = req.file?.buffer;

    if (!file || !user)
        return res.status(400).send({ error: 'Bad request' });

    const pfp = new WeebifyImage(file);

    if (!await pfp.validate(256, 1024))
        return res.status(400).send({ error: 'Image must be at least 128x128 and at most 1024x1024' });

    try {
        const key = uuid();
        console.log(`Uploading new profile picture ${key} for ${user.id}`);
        pfp.toAspectRatio(1);

        const uploads = [
            (async () => s3.uploadBuffer('pfp', `${key}/full.webp`, await pfp.export()))(),
            (async () => s3.uploadBuffer('pfp', `${key}/tiny.webp`, await pfp.getImageWithMaxHeight(64)))(),
            (async () => s3.uploadBuffer('pfp', `${key}/mid.webp`, await pfp.getImageWithMaxHeight(256)))(),
        ];

        await (await Promise.all(uploads));

        user.pfpToken = undefined;
        user.pfp = key;
        await user.save();
        res.status(200).send({ error: null, key });
    } catch (e) {

        console.error(e);
        return res.status(500).send({ error: 'Image processing failed' });
    } finally {
        pfp.destroy();
    }
    return res.status(500).send({ error: '???' });
});