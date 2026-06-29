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

router.get('/public-list', async (req, res) => {
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

router.delete('/delete/:id', async (req,res) => {
    try {
        const user = await StudySession.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).send('User not found');
        }

        res.send('Study session deleted successfully');
    } catch (error){
            res.status(500).send(error);
    }
});

router.patch('/update/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
        const AuthReq = req as AuthRequest;
        const sessionId = req.params.id;
        const userId = AuthReq.userId;

        if (!mongoose.Types.ObjectId.isValid(sessionId as string)){
            return res.status(500).json({error: `Subject ID is invalid`});
        }

        const session = await StudySession.findById(sessionId);

        if (!session){
            return res.status(500).json({error: `Subject not found`});
        }

        if (session.userId.toString() !== userId){
            return res.status(500).json({error: `your ID does not match this subjectId.`});
        }

        const updatedSession = await StudySession.findByIdAndUpdate(sessionId,
            {$set: req.body},
            {new: true, runValidators: true}
        );

        res.status(200).json(updatedSession);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: `There's a error`});
    }
});

export default router;