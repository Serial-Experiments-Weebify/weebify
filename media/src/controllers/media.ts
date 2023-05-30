import express from "express";
import { Container } from "typedi";
import sharp, { Sharp } from "sharp";
import multer, { memoryStorage } from "multer";
import { v4 as uuid } from "uuid";

import { UserDocument } from "../user/user.model";
import { S3Service } from "../services/s3.service";
import { AuthenticateUserByPfpToken } from "../user/pfpAuth.middleware";
import { WeebifyImage } from "../util/WeebifyImage";
import { AuthenticateBySetCoverToken } from "../media/setCoverAuth";
import { MediaDocument, mediaModel } from "../media/media.model";
import { urlencoded } from "body-parser";
import { JWTAuth, VideoJwt } from "../video/jwtAuth.middleware";
import { videoV0Model } from "../video/video.model";
import { Types } from "mongoose";
import { SearchService } from "../services/search.service";

const s3 = Container.get(S3Service);
const search = Container.get(SearchService);

const upload = multer({
    storage: memoryStorage(),
    limits: {
        fileSize: 20 << 20, // 10 MiB
        files: 1,
    },
});

export const media = express.Router();

media.use(urlencoded({ extended: true }));

media.post(
    "/pfp",
    AuthenticateUserByPfpToken,
    upload.single("pfp"),
    async (req, res) => {
        //@ts-ignore
        const user: UserDocument = req.user;
        const file = req.file?.buffer;

        if (!file || !user)
            return res.status(400).send({ error: "Bad request" });

        const pfp = new WeebifyImage(file);

        if (!(await pfp.validate(128, 1024)))
            return res.status(400).send({
                error: "Image must be at least 128x128 and at most 1024x1024",
            });

        try {
            const key = uuid();
            console.log(`Uploading new profile picture ${key} for ${user.id}`);
            pfp.toAspectRatio(1);

            const uploads = [
                (async () =>
                    s3.uploadBuffer(
                        "pfp",
                        `${key}/full.webp`,
                        await pfp.export()
                    ))(),
                (async () =>
                    s3.uploadBuffer(
                        "pfp",
                        `${key}/tiny.webp`,
                        await pfp.getImageWithMaxHeight(64)
                    ))(),
                (async () =>
                    s3.uploadBuffer(
                        "pfp",
                        `${key}/mid.webp`,
                        await pfp.getImageWithMaxHeight(256)
                    ))(),
            ];

            await Promise.all(uploads);

            user.pfpToken = undefined;
            user.pfp = key;

            await user.save().catch(() => console.log("Error saving"));
            await search
                .updateSingle("users", { id: user.id, pfp: key })
                .catch(() => console.log("Error updating search"));
            return res.status(200).send({ error: null, key });
        } catch (e) {
            console.error(e);
            return res.status(500).send({ error: "Image processing failed" });
        } finally {
            pfp.destroy();
        }
    }
);

media.post(
    "/cover",
    AuthenticateBySetCoverToken,
    upload.single("cover"),
    async (req, res) => {
        //@ts-ignore
        const media: MediaDocument = req.media;
        const file = req.file?.buffer;

        if (!file || !media)
            return res.status(400).send({ error: "Bad request" });

        const cover = new WeebifyImage(file);

        if (!(await cover.validate(128, 4096)))
            return res.status(400).send({
                error: "Image must be at least 128x128 and at most 4096x4096",
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
                        "cover",
                        `${key}/full.webp`,
                        await cover.export()
                    ))(),
                (async () =>
                    s3.uploadBuffer(
                        "cover",
                        `${key}/thumb.webp`,
                        await cover.getImageWithMaxHeight(300)
                    ))(),
            ];

            await Promise.all(uploads);
            let color = "#888888";
            try {
                color = await cover.getColor();
            } catch {
                console.error("Error getting image color");
            }

            media.setCoverToken = undefined;
            media.cover = key;
            media.coverColor = color;
            await media.save();
            await search
                .updateSingle("media", {
                    id: media.id,
                    cover: key,
                    coverColor: color,
                })
                .catch(() => console.log("Error updating search"));
            return res.status(200).send({ error: null, key });
        } catch (e) {
            console.error(e);
            return res.status(500).send({ error: "Image processing failed" });
        } finally {
            cover.destroy();
        }
    }
);

media.post("/video", JWTAuth, async (req, res) => {
    if (typeof req.body.key !== "string")
        return res.status(400).send({ error: "Bad key." });
    try {
        const m = (req as any as VideoJwt).media;
        if (
            typeof m.kind != "string" ||
            typeof m.mid != "string" ||
            typeof m.eid == "object"
        )
            return res.status(400).send({ error: "Bad JWT." });

        const selectedMedia = await mediaModel.findById(m.mid);
        if (!selectedMedia)
            return res.status(400).send({ error: "Bad media ID" });

        // create video
        const v = await videoV0Model.create({ key: req.body.key });
        if (!v) throw "fuck";

        const url: string = await s3.presign("media", req.body.key);
        const key = new URL(url);
        key.protocol = "";
        key.hostname = "";
        key.port = "";

        // update media
        console.log(m.kind);
        switch (m.kind) {
            case "TV":
                if (!m.eid)
                    return res.status(400).send({ error: "Bad episode ID" });

                const ep = selectedMedia?.episodes?.find((x) => {
                    return x._id.toString() == m.eid!;
                });

                if (!ep)
                    return res.status(400).send({ error: "Bad episode ID" });

                ep.mediaId = v._id;

                break;
            case "MOVIE":
                selectedMedia.mediaId = v._id;
                break;
        }
        await selectedMedia.save();

        return res.send({
            error: null,
            key: key.toString().replace(/https?:\/\/localhost/, ""),
        });
    } catch {
        if (typeof req.body.key !== "string")
            return res.status(500).send({ error: "Died" });
    }

    return res.status(500).send({ error: "Died" });
});
