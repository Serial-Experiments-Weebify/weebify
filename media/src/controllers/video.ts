import express from 'express';
import { Container } from 'typedi';
import { json } from 'body-parser';
import { CreateV0 } from '../validators/createV0.in';
import { CreateV1 } from '../validators/createV1.in';
import { AuthenticateByApiKey } from '../middleware/apiKeyAuth.middleware';
import { validateJsonBody } from '../validators/validate';
import { VideoService } from '../services/video.service';

export const videoController = express.Router();

const videoService = Container.get(VideoService);

videoController.use(AuthenticateByApiKey);
videoController.use(json());

videoController.get('/auth', async (req, res) => {
    res.status(200).json({ ok: 1 });
});

videoController.post('/create/v0', async (req, res) => {
    const data = await validateJsonBody(CreateV0, req, res);
    if (!data) return;

    try {
        const video = await videoService.createV0(data);
        res.json({ video });
    } catch (e) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

videoController.post('/create/v1', async (req, res) => {
    const data = await validateJsonBody(CreateV1, req, res);
    if (!data) return;

    try {
        const video = await videoService.createV1(data);
        res.json({ video });
    } catch (e) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

videoController.post('/verify/:id', async (req, res) => {
    const id = req.params.id;
    if (typeof id !== 'string')
        return res.status(400).json({ error: 'Bad request' });
    try {
        const video = await videoService.verify(id);
        if (!video) return res.status(404).json({ error: 'Not found' });
        res.json({ video });
    } catch (e) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// videoController.delete('/delete/:id', async (req, res) => {});

// videoController.post('/cleanup', async (req, res) => {});
