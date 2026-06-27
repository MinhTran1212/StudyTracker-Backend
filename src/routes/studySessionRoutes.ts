import mongoose from 'mongoose';
import { StudySession } from '../models/StudySession';
import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

router.post('/', requireAuth, async (req: AuthRequest, res) => {
    try {
        const { subjectId, duration, notes } = req.body;
        const convertedDuration = Number(duration);

        if (isNaN(duration) || duration < 0){
            return res.status(404).json({Error: "Duration can not be negative."});
        }

        const newSession = await StudySession.create({
            userId: new mongoose.Types.ObjectId(req.userId) as any,
            subjectId,
            duration: convertedDuration,
            notes
        });

        res.status(201).json(newSession);
    } catch (error){ 
        console.error(error);
        res.status(500).send("Failed to log sessions");
    }
})

router.get('/', async (req, res) => {
    try {
        const sessions = await StudySession.find().select("userId subjectId duration notes createdAt");

        res.status(201).json(sessions);
    } catch (error){
        console.error(error);
        res.status(500).send("Failed to get sessions");
    }
})

router.get('/', requireAuth, async (req: AuthRequest, res) => {
    const authReq = req as AuthRequest;
    try {
        if (!authReq.userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const sessions = await StudySession.find({userId: new mongoose.Types.ObjectId(authReq.userId) as any});

        res.status(201).json(sessions);
    } catch (error){
        console.error(error);
        res.status(500).send("Failed to get sessions");
    }
})

export default router;