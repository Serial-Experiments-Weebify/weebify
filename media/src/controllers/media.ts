import express from 'express';
import { Container } from 'typedi';
import multer, { memoryStorage } from 'multer';
import { v4 as uuid } from 'uuid';

import { UserDocument } from '../models/user.model';
import { S3Service } from '../services/s3.service';
import { AuthenticateUserByPfpToken } from '../middleware/pfpAuth.middleware';
import { WeebifyImage } from '../util/WeebifyImage';
import { AuthenticateBySetCoverToken } from '../middleware/coverAuth.middleware';
import { MediaDocument } from '../models/media.model';
import { urlencoded } from 'body-parser';
import { SearchService } from '../services/search.service';
import { videoController } from './video';
import { ConfigService } from '../services/config.service';
const s3 = Container.get(S3Service);
const search = Container.get(SearchService);
const conf = Container.get(ConfigService);

const upload = multer({
    storage: memoryStorage(),
    limits: {
        fileSize: 20 << 20, // 10 MiB
        files: 1,
    },
});

export const mediaController = express.Router();

const urlParser = urlencoded({ extended: true });

mediaController.use('/video', videoController);

mediaController.post(
    '/pfp',
    urlParser,
    AuthenticateUserByPfpToken,
    upload.single('pfp'),
    async (req, res) => {
        const user = (req as any).user as UserDocument;
        const file = req.file?.buffer;

        if (!file || !user)
            return res.status(400).send({ error: 'Bad request' });

        const pfp = new WeebifyImage(file);

        if (!(await pfp.validate(128, 1024)))
            return res.status(400).send({
                error: 'Image must be at least 128x128 and at most 1024x1024',
            });

        try {
            const key = uuid();
            console.log(`Uploading new profile picture ${key} for ${user}`);
            pfp.toAspectRatio(1);

            const uploads = [
                (async () =>
                    s3.uploadBuffer(
                        conf.vars.S3_BUCKET,
                        `pfp/${key}/full.webp`,
                        await pfp.export(),
                    ))(),
                (async () =>
                    s3.uploadBuffer(
                        conf.vars.S3_BUCKET,
                        `pfp/${key}/tiny.webp`,
                        await pfp.getImageWithMaxHeight(64),
                    ))(),
                (async () =>
                    s3.uploadBuffer(
                        conf.vars.S3_BUCKET,
                        `pfp/${key}/mid.webp`,
                        await pfp.getImageWithMaxHeight(256),
                    ))(),
            ];

            await Promise.all(uploads);

            user.pfpToken = undefined;
            user.pfp = key;

            await user.save().catch(() => console.log('Error saving'));
            await search
                .updateSingle('users', { id: user.id, pfp: key })
                .catch(() => console.log('Error updating search'));
            return res.status(200).send({ error: null, key });
        } catch (e) {
            console.error(e);
            return res.status(500).send({ error: 'Image processing failed' });
        } finally {
            pfp.destroy();
        }
    },
);

mediaController.post(
    '/cover',
    urlParser,
    AuthenticateBySetCoverToken,
    upload.single('cover'),
    async (req, res) => {
        const media: MediaDocument = (req as any).media as MediaDocument;
        const file = req.file?.buffer;

        if (!file || !media)
            return res.status(400).send({ error: 'Bad request' });

        const cover = new WeebifyImage(file);

        if (!(await cover.validate(128, 4096)))
            return res.status(400).send({
                error: 'Image must be at least 128x128 and at most 4096x4096',
            });

        try {
            const key = uuid();
            console.log(`Uploading new cover ${key} for ${media.id}`);

            //allow for some error
            if (cover.currentRatio > 0.76 || cover.currentRatio < 0.56)
                cover.toAspectRatio(0.66);

            const uploads = [
                (async () =>
                    s3.uploadBuffer(
                        conf.vars.S3_BUCKET,
                        `cover/${key}/full.webp`,
                        await cover.export(),
                    ))(),
                (async () =>
                    s3.uploadBuffer(
                        conf.vars.S3_BUCKET,
                        `cover/${key}/thumb.webp`,
                        await cover.getImageWithMaxHeight(300),
                    ))(),
            ];

            await Promise.all(uploads);
            let color = '#888888';
            try {
                color = await cover.getColor();
            } catch {
                console.error('Error getting image color');
            }

            media.setCoverToken = undefined;
            media.cover = key;
            media.coverColor = color;
            await media.save();
            await search
                .updateSingle('media', {
                    id: media.id,
                    cover: key,
                    coverColor: color,
                })
                .catch(() => console.log('Error updating search'));
            return res.status(200).send({ error: null, key });
        } catch (e) {
            console.error(e);
            return res.status(500).send({ error: 'Image processing failed' });
        } finally {
            cover.destroy();
        }
    },
);
