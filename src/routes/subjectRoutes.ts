import { Router } from 'express';
import { Subject } from '../models/Subject';
import mongoose  from 'mongoose';
import { requireAuth, AuthRequest } from '../middleware/authMiddleware';
import { StudySession } from '../models/StudySession';

const router = Router();

//creating a subject
router.post('/', requireAuth, async (req: AuthRequest, res) => {
    try {
        const subjectName = req.body.name;
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const newSubject = await Subject.create({
            name: subjectName,
            userId: new mongoose.Types.ObjectId(userId) as any
        });

        res.status(201).json(newSubject);
    } catch (error) {
        console.error("Failed to create subject:", error);
        res.status(500).json({ error: 'Server failed to save subject' });
    }
}); 

//get all subjects
router.get('/public-list', async (req, res) => {
    try {
        const subjects = await Subject.find().select("name topics userId");

        res.status(201).json(subjects);
    } catch (error){
        console.log("There is a error.");
        console.error(error);
        res.status(500).send("Currently there is an error.");
    }
});

router.get('/', requireAuth, async (req: AuthRequest, res) => {
    const authReq = req as AuthRequest;
    try {
        const subjects = await Subject.find({userId: new mongoose.Types.ObjectId(authReq.userId)} as any);

        res.status(201).json(subjects);
    } catch (error){
        console.error(error);
        res.status(500).send("Failed to get sessions");
    }
})

router.put('/:id/topics', async (req, res)=> {
    try {
        const id = req.params.id;
        const  name  = req.body.topicName;
        
        const updatedSubject = await Subject.findByIdAndUpdate(id,
            {
                $push: {
                    topics: { topicName: name, isCompleted: false }
                }
            },
            { returnDocument: 'after' }
         );

        if (!updatedSubject) {
            console.log("Null Pointer");
            return res.status(404).json({ error: 'Subject not found'});
        }
        res.status(200).json(updatedSubject);
    } catch (error) {
        console.error(error);
        res.status(500).send(`There's a error. Failed to update the topic.`);
    }
})

router.delete('/:id/topics/:topicId', async (req, res) => {
    try {
        const id = req.params.id;
        const id2 = req.params.topicId;
        const name = req.body;

        const newSubject = await Subject.findByIdAndUpdate(id,
            {
                $pull: {
                    topics: {_id: id2} 
                },
            },
            { new: true }
        );

        if (!newSubject){
            console.log("Not found subject");
            return res.status(404).json({error: 'Subject not found'});
        }

        res.status(200).json(newSubject);
    } catch (error){
        console.error(error);
    }
});

router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
        const authReq = req as AuthRequest;
        const subjectId = req.params.id; 
        const userId = authReq.userId;

        if (!mongoose.Types.ObjectId.isValid(subjectId as string)){
            return res.status(400).json({error: 'Invalid ID format'});
        }

        const subject = await Subject.findById(subjectId);

        if (!subject){
            return res.status(400).json({error: 'Subject not found'});
        }

        if (subject.userId.toString() !== userId){
            return res.status(400).json({error: 'You do not have access to this subject'});
        }

        await Subject.findByIdAndDelete(subjectId);
        res.status(200).json({ message: 'Subject deleted successfully' });
    } catch (error){
        console.error(error);
        res.status(500).json({ error: 'Server failed to delete subject' });
    }
});

router.patch('/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
        const AuthReq = req as AuthRequest;
        const subjectId = req.params.id;
        const userId = AuthReq.userId;

        if (!mongoose.Types.ObjectId.isValid(subjectId as string)){
            return res.status(500).json({error: `Subject ID is invalid`});
        }

        const subject = await Subject.findById(subjectId);

        if (!subject){
            return res.status(500).json({error: `Subject not found`});
        }

        if (subject.userId.toString() !== userId){
            return res.status(500).json({error: `your ID does not match this subjectId.`});
        }

        const updatedSubject = await Subject.findByIdAndUpdate(subjectId,
            {$set: req.body},
            {new: true, runValidators: true}
        );

        res.status(200).json(updatedSubject);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: `There's a error`});
    }
});

export default router;